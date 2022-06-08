import { debugPosition, cameraFlyTo, getDefer, cartesian32LonLat } from "ht-cesium-utils";
import Box from "./Box";
import * as RoutePlan from "./czml/routePlan";
import * as Helper from "./helper";
import CONFIG from "./config";
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
	//流程1
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
	//流程2
	async sendMan() {
		this.destroyManBox();
		this.manBox = new Box(this.viewer);
		// this._sendMan();
		const start = this.accidentTime;
		let end = Cesium.JulianDate.addSeconds(start, 60, new Cesium.JulianDate());
		if (!this.startPosition) {
			await this.initStartPosition();
		}
		// let entity = this.manBox.add();
		let { east, west, north, south } = Helper.fourPointByOne(this.accodemtPosition, CONFIG.SAFE_DISTANCE, Math.PI / 2);
		const _sendMan = async (targetPosition) => {
			const e = await Helper.createManByRoutePlan(start, end, this.startPosition, targetPosition, this.tk);
			e.properties.addProperty("targetPosition", Cesium.ConstantPositionProperty(targetPosition));
			this.manBox.add(e);
		};
		const cb1 = (clock) => {
			if (Cesium.JulianDate.greaterThan(clock.currentTime, end)) {
				this.manBox.list.forEach((entity) => {
					entity.position = entity.properties["targetPosition"];
				});
				this.viewer.clock.onTick.removeEventListener(cb1);
			}
		};
		this.viewer.clock.onTick.addEventListener(cb1);
		_sendMan(east);
		_sendMan(west);
		_sendMan(north);
		_sendMan(south);
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
