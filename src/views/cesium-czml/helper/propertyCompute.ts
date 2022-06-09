import { debugPosition, cameraFlyTo, getDefer, cartesian32LonLat, giveCartesian3Height } from "ht-cesium-utils";
import * as RoutePlan from "../czml/routePlan";
import { lineString, length } from "@turf/turf";
import CONFIG from "../config";
import * as EntityOp from "./entityOperation";
import * as EntityMa from "./entityMake";

export function cameraAournd(viewer, position, startTime, duration, totalAngle = 360) {
	const defer = getDefer();
	let angle = totalAngle / duration;
	let initialHeading = viewer.camera.heading;
	// let startTime = viewer.clock.currentTime;
	var Exection = function TimeExecution() {
		// 当前已经过去的时间，单位s
		var delTime = Cesium.JulianDate.secondsDifference(viewer.clock.currentTime, startTime);
		let currentAngle = delTime * angle;
		// 根据过去的时间，计算偏航角的变化
		var heading = Cesium.Math.toRadians(currentAngle) + initialHeading;

		viewer.camera.lookAt(position, new Cesium.HeadingPitchRange(heading, viewer.camera.pitch, 200));

		if (currentAngle > totalAngle) {
			viewer.clock.onTick.removeEventListener(Exection);
			viewer.camera.lookAtTransform(Cesium.Matrix4.IDENTITY);
			defer.resolve();
		}
	};
	viewer.clock.onTick.addEventListener(Exection);
	return defer.promise;
}
export function setTrackedEntity(viewer, entity, seconds) {
	viewer.trackedEntity = entity;
	setTimeout(() => {
		viewer.trackedEntity = undefined;
	}, seconds * 1000);
}

export function lerp(min, max, t) {
	return (1 - t) * min + t * max;
}
export function updateSpeedLabel(velocityVectorProperty, time) {
	const velocityVector = new Cesium.Cartesian3();
	velocityVectorProperty.getValue(time, velocityVector);
	const metersPerSecond = Cesium.Cartesian3.magnitude(velocityVector);
	const kmPerHour = Math.round(metersPerSecond * 3.6);
	return `${kmPerHour} km/hr`;
}
/**
 * 给出一个点，计算该点东西南北的四个点
 */
export function fourPointByOne(position, distance, rotation = 0) {
	let east, west, south, north;
	const transform = Cesium.Transforms.eastNorthUpToFixedFrame(position);
	east = new Cesium.Cartesian3(distance, 0, 0);
	west = new Cesium.Cartesian3(-1 * distance, 0, 0);
	north = new Cesium.Cartesian3(0, distance, 0);
	south = new Cesium.Cartesian3(0, -1 * distance, 0);
	const normal = new Cesium.Cartesian3(0, 0, 1);
	// let rotation = Math.random() * Math.PI;
	Cesium.Matrix4.multiplyByPointAsVector(transform, normal, normal);
	Cesium.Cartesian3.normalize(normal, normal);
	const change = (translatePoint) => {
		Cesium.Matrix4.multiplyByPointAsVector(transform, translatePoint, translatePoint);
		//飞线机旋转某个角度，已废弃
		const q = Cesium.Quaternion.fromAxisAngle(normal, rotation);
		const m4 = Cesium.Matrix4.fromRotationTranslation(Cesium.Matrix3.fromQuaternion(q));
		const p = Cesium.Matrix4.multiplyByPoint(m4, translatePoint, new Cesium.Cartesian3());
		Cesium.Cartesian3.add(position, p, translatePoint);
	};
	change(east);
	change(west);
	change(north);
	change(south);
	return { east, west, north, south };
}
/**
 * 墙贴图时，墙长不同，采用同样的repeat值会导致图片变形，这里根据墙长计算X方向上重复的值。
 */
export function computeRepeatX(positions, wallHeigth, imageWidth, imageHeight) {
	let lineLength = length(
		lineString(
			positions.map((x) => {
				let _x = cartesian32LonLat(x);
				return [_x.lon, _x.lat];
			})
		),
		{
			units: "meters",
		}
	);
	let shouldWidth = (imageWidth / imageHeight) * wallHeigth;
	let repeatX = Math.ceil(lineLength / shouldWidth);
	return repeatX;
}
/**
 * 给出两或多点，计算移动路径
 */
export function positionWithConstVelocity(start, end, cartesian3List) {
	if (cartesian3List.length === 2) {
		return positionWithConstVelocityFromTwoPoint(start, end, cartesian3List[0], cartesian3List[1]);
	} else {
		return positionsWithConstVelocityFromCartesian3List(start, end, cartesian3List);
	}
}
function positionWithConstVelocityFromTwoPoint(start, end, startPosition, endPosition, numberOfSamples = 10) {
	const totalSeconds = Cesium.JulianDate.secondsDifference(end, start);
	// Create a path for our model by lerping between two positions.
	const position = new Cesium.SampledPositionProperty();
	for (let i = 0; i <= numberOfSamples; ++i) {
		const factor = i / numberOfSamples;
		const time = Cesium.JulianDate.addSeconds(start, factor * totalSeconds, new Cesium.JulianDate());
		const location = Cesium.Cartesian3.lerp(startPosition, endPosition, factor, new Cesium.Cartesian3());
		position.addSample(time, location);
	}
	return position;
}

/**
 * 给出起止时间和路径，计算一个使物体匀速运动的positionProperty
 */
function positionsWithConstVelocityFromCartesian3List(start, end, cartesian3List) {
	const position = new Cesium.SampledPositionProperty();
	const totalSeconds = Cesium.JulianDate.secondsDifference(end, start);

	//计算总距离和各个点之间的距离
	let totalDistance = 0;
	let prevLocation = cartesian3List[0];
	const distanceList = [];
	cartesian3List.forEach((cartesian, index) => {
		totalDistance += Cesium.Cartesian3.distance(cartesian, prevLocation);
		distanceList.push(totalDistance);
		prevLocation = cartesian;
	});
	//将时间平均分配到各个点上，使得物体能匀速运动
	cartesian3List.forEach((cartesian, index) => {
		let factor = distanceList[index] / totalDistance;
		// factor = Math.pow(factor, 2);
		let addSeconds = lerp(0, totalSeconds, factor);
		let curTime = Cesium.JulianDate.addSeconds(start, addSeconds, new Cesium.JulianDate());
		position.addSample(curTime, cartesian);
	});
	return position;
}
/**
 * A面朝B时的orientation
 */
export function getOrientationOfA(pointA, pointB) {
	//向量AB
	const vector2 = Cesium.Cartesian3.subtract(pointB, pointA, new Cesium.Cartesian3());
	//归一化
	const normal = Cesium.Cartesian3.normalize(vector2, new Cesium.Cartesian3());
	//旋转矩阵 rotationMatrixFromPositionVelocity源码中有，并未出现在cesiumAPI中
	const rotationMatrix3 = Cesium.Transforms.rotationMatrixFromPositionVelocity(pointA, normal, Cesium.Ellipsoid.WGS84);
	const orientation = Cesium.Quaternion.fromRotationMatrix(rotationMatrix3);
	return orientation;
}
export async function positionFromRoutePlan(startPosition, endPosition, tk) {
	let startP = cartesian32LonLat(startPosition);
	let endP = cartesian32LonLat(endPosition);
	const routes = await RoutePlan.getRouteFromLonlat([startP.lon, startP.lat], [endP.lon, endP.lat], tk);
	const cartesian3List = routes[0].cartesian3List;
	return cartesian3List;
}
export function emitterModelMatrixOfWater(emitterPositition, firePosition) {
	let temp = cartesian32LonLat(firePosition);
	temp.height *= 2;
	temp = Cesium.Cartesian3.fromDegrees(temp.lon, temp.lat, temp.height);
	let normal = Cesium.Cartesian3.subtract(temp, emitterPositition, new Cesium.Cartesian3());
	Cesium.Cartesian3.normalize(normal, normal);
	let axis = new Cesium.Cartesian3();
	Cesium.Cartesian3.cross(normal, Cesium.Cartesian3.UNIT_Z, axis);
	return Cesium.Matrix4.fromRotationTranslation(
		Cesium.Matrix3.fromQuaternion(Cesium.Quaternion.fromAxisAngle(axis, Math.PI / 4))
	);
	// return Cesium.Matrix4.fromRotationTranslation(Cesium.Matrix3.fromRotationX(Math.PI / 4, new Cesium.Matrix3()));
}
