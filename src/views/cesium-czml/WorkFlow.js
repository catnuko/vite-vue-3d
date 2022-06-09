import { cameraFlyTo, giveCartesian3Height } from "ht-cesium-utils";
import Box from "./Box";
import * as RoutePlan from "./czml/routePlan";
import * as Helper from "./helper";
import CONFIG from "./config";
import { mitter, EVENT } from "./mitt";

export default class WorkFlow {
	constructor(viewer, title, tk) {
		this.viewer = viewer;
		this.title = title;
		this.tk = tk;
		this.mitter = mitter;
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
		let createWallEnd = Cesium.JulianDate.addSeconds(end, 10, new Cesium.JulianDate());
		if (!this.startPosition) {
			await this.initStartPosition();
		}
		// let entity = this.manBox.add();
		let wallPositions = Helper.PropertyCo.fourPointByOne(this.accodemtPosition, CONFIG.WALL_DISTANCE);
		wallPositions = [wallPositions.east, wallPositions.north, wallPositions.west, wallPositions.south];
		let manPositions = Helper.PropertyCo.fourPointByOne(this.accodemtPosition, CONFIG.MAN_DISTANCE, Math.PI / 4);
		manPositions = [manPositions.east, manPositions.north, manPositions.west, manPositions.south];
		let tempBox = new Box(this.viewer);
		let pl = wallPositions.map(async (position, index) => {
			//人从警局到火灾现场
			const cartesian3List = await Helper.PropertyCo.positionFromRoutePlan(this.startPosition, position, this.tk);
			const manEntity = Helper.EntityMa.createMan();
			let nextTargetPosition;
			if (index === wallPositions.length - 1) {
				nextTargetPosition = wallPositions[0];
			} else {
				nextTargetPosition = wallPositions[index + 1];
			}
			manEntity._targetPosition = position;
			manEntity._nextTargetPosition = nextTargetPosition;
			manEntity._manPosition = manPositions[index];

			this.manBox.add(manEntity);
			await Helper.EntityOp.moveMan(this.viewer, manEntity, start, end, cartesian3List);
			Helper.EntityOp.faceTo(manEntity, this.accodemtPosition);
			this.mitter.emit(EVENT.FIRE_MAN_ARRIVED, { workFlow: this });
			//四面墙合成一个
			let newWall = Helper.EntityMa.createWallAroundPointDynamicly(
				end,
				createWallEnd,
				manEntity._targetPosition,
				manEntity._nextTargetPosition
			);
			tempBox.add(newWall);
			//四面墙合成一个人跟随
			await Helper.EntityOp.moveMan(this.viewer, manEntity, end, createWallEnd, [
				manEntity._targetPosition,
				manEntity._nextTargetPosition,
			]);
			this.mitter.emit(EVENT.FIRE_WALL_CREATED, { workFlow: this });
			return;
		});
		await Promise.all(pl);
		tempBox.destroy();
		tempBox = null;
		//创建墙
		this.accidentBox.add(Helper.EntityMa.wallAroundPoint(this.accodemtPosition, CONFIG.WALL_DISTANCE));
		//人回到灭火位置
		this.manBox.list.forEach(async (manEntity) => {
			await Helper.EntityOp.moveMan(
				this.viewer,
				manEntity,
				createWallEnd,
				Cesium.JulianDate.addSeconds(createWallEnd, 5, new Cesium.JulianDate()),
				[manEntity._nextTargetPosition, manEntity._manPosition]
			);
			Helper.EntityOp.faceTo(manEntity, this.accodemtPosition);
			let emitterPosition = giveCartesian3Height(manEntity._manPosition, CONFIG.WALL_HEIGTH);
			this.accidentBox.add(Helper.EntityMa.createWater(emitterPosition, this.accodemtPosition));
		});

		this.viewer.flyTo(this.accidentBox.list);
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
