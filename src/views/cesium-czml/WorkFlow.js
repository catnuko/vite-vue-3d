import { debugPosition, cameraFlyTo, getDefer, cartesian32LonLat } from "ht-cesium-utils";
import Box from "./Box";
import * as RoutePlan from "./czml/routePlan";

export default class WorkFlow {
	constructor(viewer, title, tk) {
		this.viewer = viewer;
		this.title = title;
		this.tk = tk;

		this.steps = [];
		this.setSteps([
			{
				num: 1,
				title: "了解情况",
				content: "了解现场情况",
			},
			{
				num: 2,
				title: "实时监控",
				content: "打开现场监控",
			},
			{
				num: 3,
				title: "派出人员",
				content: "派人处理事件",
			},
		]);
	}
	initStartPosition() {
		if (this.startPosition) return;
		return RoutePlan.getPlaceLocation(this.startPlace, this.tk).then((res) => {
			this.startPosition = Cesium.Cartesian3.fromDegrees(res.lon, res.lat);
		});
	}
	cameraFlyTo(view) {
		cameraFlyTo(this.viewer, view.position, view.hpr);
	}
	setSteps(steps) {
		this.steps = steps;
	}
	saveAccidentData(position, time, view) {
		this.accidentTime = time;
		this.accodemtPosition = position;
		this.accodemtView = view;
	}
	destroyAccidentBox() {
		if (this.accidentBox) {
			this.accidentBox.destroy();
			this.accidentBox = null;
		}
	}
	setAccident(position, time, view) {
		this.destroyAccidentBox();
		this.saveAccidentData(position, time, view);
		this.accidentBox = new Box(this.viewer);
		this._setAccident(position, time, view);
		// view && cameraFlyTo(this.viewer, view.position, view.hpr);
		// return cameraAournd(this.viewer, this.accodemtPosition, this.viewer.clock.currentTime, 5, 360);
	}
	destroyManBox() {
		if (this.manBox) {
			this.manBox.destroy();
			this.manBox = null;
		}
	}
	async sendMan() {
		this.destroyManBox();
		this.manBox = new Box();
		// this._sendMan();
		const start = this.accidentTime;
		let end = Cesium.JulianDate.addSeconds(start, 10, new Cesium.JulianDate());
		if (!this.startPosition) {
			await this.initStartPosition();
		}
		let entity = this.manBox.add(createManByRoutePlan(start, end, this.startPosition, this.accodemtPosition, this.tk));
		setTrackedEntity(this.viewer, entity, 5);
	}
	_setAccident(position, time, view) {
		throw new Error("重载错误");
	}
	_sendMan(targetPlace) {
		throw new Error("重载错误");
	}
	start() {}
	pause() {
		this.viewer.clock.shouldAnimate = false;
	}
	stop() {}
	openVideo() {}
}
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
	const position = new Cesium.SampledPositionProperty();
	let secondStep = Cesium.JulianDate.secondsDifference(end, start) / cartesian3List.length;
	cartesian3List.forEach((cartesian, index) => {
		let curTime = Cesium.JulianDate.addSeconds(start, secondStep * index);
		position.addSample(cartesian, curTime);
	});
	const modelLabel = new Cesium.Entity({
		position: position,
		orientation: new Cesium.VelocityOrientationProperty(position), // Automatically set the model's orientation to the direction it's facing.
		label: {
			text: "警察",
			font: "20px sans-serif",
			showBackground: true,
			distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0.0, 100.0),
			eyeOffset: new Cesium.Cartesian3(0, 7.2, 0),
		},
		model: {
			uri: "./libs/Cesium/SampleData/models/CesiumMan/Cesium_Man.glb",
			scale: 1,
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
				color: Cesium.Color.PALEGOLDENROD,
			}),
		},
	});
	return modelLabel;
}
