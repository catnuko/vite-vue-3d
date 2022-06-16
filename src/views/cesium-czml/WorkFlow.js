import { cameraFlyTo, cartesian32LonLat, giveCartesian3Height } from "ht-cesium-utils";
import Box from "./Box";
import * as RoutePlan from "./czml/routePlan";
import * as Helper from "./helper";
import CONFIG from "./config";
import { mitter, EVENT } from "./mitt";
import * as CzmlUtils from "./czml";

export default class WorkFlow {
	constructor(viewer, title, tk) {
		this.viewer = viewer;
		this.title = title;
		this.tk = tk;
		this.mitter = mitter;
		this.steps = [];
		this.startPosition = undefined;//工作人员出发的地点
	}
	async init() {
		await this.initStartPosition();
	}
	setSteps(steps) {
		this.steps = steps;
	}
	initStartPosition() {
		if (this.startPosition) return;
		return RoutePlan.getPlaceLocation(this.startPlace, this.tk).then((res) => {
			this.startPosition = Cesium.Cartesian3.fromDegrees(res.lon, res.lat);
		});
	}
	//流程1
	setAccident(position, time, view) {
		this.accidentTime = time;
		this.accodemtPosition = position;
		this.accodemtView = view;
	}
	loadCzml() {
		throw new Error("重载错误");
	}
	start() {
		this.viewer.clock.shouldAnimate = true;
	}
	pause() {
		this.viewer.clock.shouldAnimate = false;
	}
	stop() {}
	openVideo() {}
	destroy(){
		
	}
}
