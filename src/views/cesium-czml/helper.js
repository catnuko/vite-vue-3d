import { debugPosition, cameraFlyTo, getDefer, cartesian32LonLat } from "ht-cesium-utils";
import * as RoutePlan from "./czml/routePlan";

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
export async function createManByRoutePlan(start, end, startPosition, endPosition, tk) {
	let startP = cartesian32LonLat(startPosition);
	let endP = cartesian32LonLat(endPosition);
	const routes = await RoutePlan.getRouteFromLonlat([startP.lon, startP.lat], [endP.lon, endP.lat], tk);
	const cartesian3List = routes[0].cartesian3List;
	return createMan(start, end, cartesian3List);
}

export function createMan(start, end, cartesian3List) {
	let position = positionsWithConstVelocity(start, end, cartesian3List);
	const modelLabel = new Cesium.Entity({
		position: position,
		orientation: new Cesium.VelocityVectorProperty(position), // Automatically set the model's orientation to the direction it's facing.
		label: {
			text: "警察",
			font: "20px sans-serif",
			showBackground: true,
			// distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0.0, 100.0),
			eyeOffset: new Cesium.Cartesian3(0, 7.2, 0),
		},
		model: {
			uri: "./libs/Cesium/SampleData/models/CesiumMan/Cesium_Man.glb",
			scale: 4,
			heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
		},
		path: {
			leadTime: 2,
			trailTime: 60,
			width: 10,
			resolution: 1,
			material: new Cesium.PolylineGlowMaterialProperty({
				glowPower: 0.3,
				taperPower: 0.3,
				color: Cesium.Color.RED,
			}),
		},
		properties: {},
	});
	return modelLabel;
}
export function createModel() {}
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

		//不旋转
		Cesium.Cartesian3.add(position, translatePoint, translatePoint);
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
export function computeRepeatX(wallHeigth, imageWidth, imageHeight) {
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
 * 给出起止时间和路径，计算一个使物体匀速运动的positionProperty
 */
export function positionsWithConstVelocity(start, end, cartesian3List) {
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
