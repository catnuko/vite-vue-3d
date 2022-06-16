import { debugPosition, cameraFlyTo, getDefer, cartesian32LonLat, giveCartesian3Height } from "ht-cesium-utils";
import * as RoutePlan from "../czml/routePlan";
import { lineString, length, angle } from "@turf/turf";
import { v4 as uuidv4 } from "uuid";
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
 * 给出两或多点，计算移动路径，匀速
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
		let addSeconds = lerp(0, totalSeconds, factor);
		let curTime = Cesium.JulianDate.addSeconds(start, addSeconds, new Cesium.JulianDate());
		position.addSample(curTime, cartesian);
	});
	return position;
}
export function czmlPositionWithAccelerateVelocity(start, end, cartesian3List) {
	let property = positionWithAccelerateVelocity(start, end, cartesian3List);
	return czmlPotitionProperty(property);
}
/**
 * 给出两或多点，计算移动路径,先加速后急减速
 */
export function positionWithAccelerateVelocity(start, end, carteain3List) {
	const totalSeconds = Cesium.JulianDate.secondsDifference(end, start);
	let startPosition = carteain3List[0];
	let endPosition = carteain3List[1];

	const position = new Cesium.SampledPositionProperty();
	const numberOfSamples = 100;
	for (let i = 0; i <= numberOfSamples; ++i) {
		const factor = i / numberOfSamples;
		const time = Cesium.JulianDate.addSeconds(start, factor * totalSeconds, new Cesium.JulianDate());
		//factor:[0,1],factor的平方:[0,1]
		// const locationFactor = Math.pow(factor, 2);
		//factor:[0,1],factor的平方:[0,1]
		const locationFactor = Math.sin((factor * Math.PI) / 2);
		const location = Cesium.Cartesian3.lerp(startPosition, endPosition, locationFactor, new Cesium.Cartesian3());
		position.addSample(time, location);
	}
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
/**
 * 给出发射器的位置和目的地的位置，计算发射器旋转的角度，也就是模型矩阵
 */
export function emitterModelMatrixOfWater(emitterPositition, firePosition) {
	const ROTATION = Math.PI / 4;
	let normal = Cesium.Cartesian3.subtract(firePosition, emitterPositition, new Cesium.Cartesian3());
	let transform = Cesium.Transforms.eastNorthUpToFixedFrame(emitterPositition);
	transform = Cesium.Matrix4.inverse(transform, new Cesium.Matrix4());
	normal = Cesium.Matrix4.multiplyByPointAsVector(transform, normal, new Cesium.Cartesian3());
	let axis = new Cesium.Cartesian3();
	Cesium.Cartesian3.cross(Cesium.Cartesian3.UNIT_Z, normal, axis);
	return Cesium.Matrix4.fromRotationTranslation(
		Cesium.Matrix3.fromQuaternion(
			Cesium.Quaternion.fromAxisAngle(Cesium.Cartesian3.normalize(axis, new Cesium.Cartesian3()), ROTATION)
		)
	);
}
/**
 * 开始时间，结束时间，[cartesian3]
 *
 * 返回：[time,x,y,z,time,x,y,z]
 */
export function czmlPositionWithConstVelocity(start, end, cartesian3List) {
	let property = positionWithConstVelocity(start, end, cartesian3List);
	return czmlPotitionProperty(property);
}
export function czmlPotitionProperty(property) {
	let cartesian = [];
	const values = property._property._values;
	const times = property._property._times;
	const packedLength = property._property._packedLength;
	times.forEach((time, index) => {
		let startIndex = index * packedLength;
		let endIndex = startIndex + packedLength;
		let curPosition = values.slice(startIndex, endIndex);
		cartesian.push(Cesium.JulianDate.toIso8601(time), curPosition[0], curPosition[1], curPosition[2]);
	});
	return cartesian;
}
export function czmlAvailability(start, end) {
	return Cesium.JulianDate.toIso8601(start) + "/" + Cesium.JulianDate.toIso8601(end);
}
export function czmlToEpoch(list, elementLength) {
	let epoch = list[0];
	for (let i = 0; i < list.length; i += elementLength) {
		if (i === 0) {
			list.splice([i], 1, 0);
		} else {
			let seconds = Cesium.JulianDate.secondsDifference(
				Cesium.JulianDate.fromIso8601(list[i]),
				Cesium.JulianDate.fromIso8601(epoch)
			);
			list.splice([i], 1, seconds);
		}
	}
	return {
		epoch,
		list,
	};
}
// export function czmlReferenceCompositeValue(czml, propertyName, value) {
// 	const id = uuidv4();
// 	czml.push({
// 		id: id,
// 		[propertyName]: value,
// 	});
// 	return id + "#" + propertyName;
// }
/**
 * 开始时间，间隔秒数列表，计算每个间隔的时间。
 */
export function incrementJulianDateList(start, secondList) {
	let list = [];
	let lastTime = start;
	secondList.map((seconds) => {
		let curTime = new Cesium.JulianDate();
		Cesium.JulianDate.addSeconds(lastTime, seconds, curTime);
		list.push(curTime);
		lastTime = curTime;
	});
	return list;
}
/**
 * 计算随时间变化的X重复值,起点：不动的点，重点：随时间变化的点，墙高，材质宽，材质高，Y方向的重复值
 */
export function czmlComputeRepeatX(startPosition, cartesian3List, wallHeigth, imageWidth, imageHeight, repeatY = 1) {
	let res = [];
	for (let i = 0; i < cartesian3List.length; i += 4) {
		let time = cartesian3List[i + 0];
		let endPosition = new Cesium.Cartesian3(cartesian3List[i + 1], cartesian3List[i + 2], cartesian3List[i + 3]);
		let X = computeRepeatX([startPosition, endPosition], wallHeigth, imageWidth, imageHeight);
		res.push(time, X, repeatY);
	}
	return res;
}
/**
 * curPosition->faceToPosition方向上距curPosition 0.1米的位置
 * @param curPosition 当前位置
 * @param faceToPosition 面向的位置
 * @returns 真正面向的位置
 */
export function computeFaceToPosition(curPosition, faceToPosition) {
	let realFaceToPosition = new Cesium.Cartesian3();
	let length = Cesium.Cartesian3.distance(curPosition, faceToPosition);
	Cesium.Cartesian3.lerp(curPosition, faceToPosition, 0.1 / length, realFaceToPosition);
	return realFaceToPosition;
}
/**
 *
 * @param start 开始时间
 * @param end 结束时间
 * @param position 当前位置
 * @param faceToPosition 面朝的位置，可以是很远的位置
 * @returns 两个时间节点，控制模型的位置（位置持续到end）和朝向
 */
export function czmlStandAt(start, end, position, faceToPosition) {
	let realFaceToPosition = computeFaceToPosition(position, faceToPosition);
	return [
		[Cesium.JulianDate.toIso8601(start), position.x, position.y, position.z],
		[Cesium.JulianDate.toIso8601(end), realFaceToPosition.x, realFaceToPosition.y, realFaceToPosition.z],
	];
}
/**
 * 如果target(也就是FirstOBJ[key])存在，
 * 且是对象的话再去调用deepObjectMerge，
 * 否则就是FirstOBJ[key]里面没这个对象，需要与SecondOBJ[key]合并
 */
export function deepObjectMerge(FirstOBJ, SecondOBJ) {
	// 深度合并对象
	for (var key in SecondOBJ) {
		FirstOBJ[key] =
			FirstOBJ[key] && FirstOBJ[key].toString() === "[object Object]"
				? deepObjectMerge(FirstOBJ[key], SecondOBJ[key])
				: (FirstOBJ[key] = SecondOBJ[key]);
	}
	return FirstOBJ;
}
/**
 * czml中需要添加并引用某个属性时使用
 * @param czml
 * @param propertyPath billboard.image
 * @param value billboard.image的值
 * @param packetId 可传可不传
 * @returns 对属性的引用
 */
export function czmlReferenceCompositeValue(czml, propertyPath, value, packetId = uuidv4()) {
	let curPacket = czml.find((x) => x.id === packetId);
	if (!curPacket) {
		curPacket = {
			id: packetId,
		};
	}
	const getProperty = (obj, propertyName) => {
		let property = obj[propertyName];
		if (!property) {
			property = {};
			obj[propertyName] = property;
		}
		return property;
	};
	let pathList = propertyPath.split(".");
	let fakeCurPacket = {};
	let lastProperty = fakeCurPacket;
	pathList.slice(0, pathList.length - 1).forEach((path) => {
		let newProperty = getProperty(lastProperty, path);
		lastProperty = newProperty;
	});
	lastProperty[pathList[pathList.length - 1]] = value;
	// curPacket = Object.assign(curPacket,fakeCurPacket);
	curPacket = deepObjectMerge(curPacket, fakeCurPacket);
	czml.push(curPacket);
	return packetId + "#" + propertyPath;
}

export function carteain3ToList(carteain3) {
	return [carteain3.x, carteain3.y, carteain3.z];
}
/**
 * 在[start,end]时间段内闪烁showNumber次
 * @returns 
 */
export function czmlFlashingShow(czml, propertyPath, start, end, showNumber, packetId) {
	let timeList = splitTimeInterval(start, end, showNumber * 2 - 1);
	let timeIntervalList = timeListToTimeIntervalList(timeList);
	timeIntervalList.forEach((t, index) => {
		t.value = !(index % 2 === 0);
	});
	return czmlReferenceCompositeValue(czml, propertyPath, timeIntervalList, packetId);
}
/**
 * 将时间分成num+2份，2指的是开始和结束
 */
export function splitTimeInterval(start, end, num) {
	let seconds = Cesium.JulianDate.secondsDifference(end, start);
	seconds = Math.abs(seconds);
	let step = seconds / num;
	let list = [start];
	for (let i = 0; i < num; i++) {
		list.push(Cesium.JulianDate.addSeconds(start, step * i, new Cesium.JulianDate()));
	}
	list.push(end);
	return list;
}
/**
 * [JulianDate,JulianDate,JulianDate,]=>[timeIntreval,timeIntreval,]
 */
export function timeListToTimeIntervalList(timeList) {
	let intervalList = [];
	for (let i = 0; i < timeList.length - 1; i++) {
		intervalList.push({
			interval: czmlAvailability(timeList[i], timeList[i + 1]),
		});
	}
	return intervalList;
}
/**
 * 计算一个矩形的坐标，并将其旋转至指定的角度，角度由startPosition,targetPosition控制
 * 			北
 * D----------------C
 * |				|
 * |				|
 * |		*		|
 * |directionPosition|		东
 * |				|
 * |				|
 * |				|
 * A----------------B
 * 			*
 * 	  startPosition
 */
export function createRectangleCoordinates(startPosition, targetPosition, width, height) {
	let halfWidth = width / 2;
	let A = new Cesium.Cartesian3(-halfWidth, 0, 0);
	let B = new Cesium.Cartesian3(halfWidth, 0, 0);
	let C = new Cesium.Cartesian3(halfWidth, height, 0);
	let D = new Cesium.Cartesian3(-halfWidth, height, 0);
	let rotation = angelToTargetPosition(startPosition, targetPosition);
	console.log(Cesium.Math.toDegrees(rotation));
	const transform = Cesium.Transforms.headingPitchRollToFixedFrame(
		startPosition,
		new Cesium.HeadingPitchRoll(rotation, 0, 0)
	);
	const change = (position) => {
		Cesium.Matrix4.multiplyByPoint(transform, position, position);
		return position;
	};
	return [A, B, C, D].map(change);
}
/**
 * 计算角AOB,顺时针
 * 			A
 * 			|
 * 			|
 * 			|
 * 			|
 * 			|
 * 			O
 * 			startPosition
 * 		  |
 * 		|
 * 	   |
 * 	  |
 * 	|
 * B
 * targetPosition
 */
export function angelToTargetPosition(startPosition, targetPosition) {
	let O = startPosition;
	let B = targetPosition;
	const transform = Cesium.Transforms.eastNorthUpToFixedFrame(startPosition);
	let A = new Cesium.Cartesian3(0, 1, 0);
	let OA = new Cesium.Cartesian3();
	Cesium.Matrix4.multiplyByPoint(transform, A, A);
	Cesium.Cartesian3.subtract(A, O, OA);
	Cesium.Cartesian3.normalize(OA, OA);
	let OB = new Cesium.Cartesian3();
	Cesium.Cartesian3.subtract(B, O, OB);
	Cesium.Cartesian3.normalize(OB, OB);
	let cosValue = Cesium.Cartesian3.dot(OB, OA);
	let res = Math.acos(cosValue);
	if (
		Cesium.Cartographic.fromCartesian(targetPosition).longitude <
		Cesium.Cartographic.fromCartesian(startPosition).longitude
	) {
		return Math.PI * 2 - res;
	} else {
		return res;
	}
}
