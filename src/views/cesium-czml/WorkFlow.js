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
	async beforeCzml(czml) {
		this.czml = [
			{
				id: "document",
				version: "1.0",
			},
		];
		this.czmlBox = new Box(this.viewer);
		this.czmlDataSource = new Cesium.CzmlDataSource("test");
		this.viewer.dataSources.add(this.czmlDataSource);
		//初始化时间
		const startAccident = this.accidentTime;
		const [startSendMan, currentTime, endSendMan, endCreateWall, endToManPosition] = Helper.incrementJulianDateList(
			startAccident,
			[5, 58, 2, 5, 2]
		);
		const finalEnd = Cesium.JulianDate.addMinutes(startAccident, 60, new Cesium.JulianDate());
		this.timeNode = {
			startAccident,
			startSendMan,
			currentTime,
			endSendMan,
			endCreateWall,
			endToManPosition,
			finalEnd,
		};
		this.viewer.timeline.zoomTo(startAccident, finalEnd);
		this.czml[0].clock = {
			//TODO 测试,当前时间
			currentTime: Cesium.JulianDate.toIso8601(currentTime),
			interval: Helper.czmlAvailability(startSendMan, finalEnd),
			multiplier: 1,
		};

		if (!this.startPosition) {
			await this.initStartPosition();
		}
		//初始化视角
		this.viewDestroyHandle = Helper.setTimeViewList(this.viewer, [
			{
				start: startAccident,
				stop: startSendMan,
				data: {
					destination: [-2746801.160400554, 4763651.357878603, 3220910.967226206],
					hpr: [0.2741199786935695, -0.4688640631721803, 6.283182631305866],
				},
			},
		]);
	}
	destroyCzml() {
		this.viewDestroyHandle && this.viewDestroyHandle();
	}
	async sendManCzml() {
		const self = this;
		await this.beforeCzml();
		const { czml } = this;
		const { startAccident, startSendMan, currentTime, endSendMan, endCreateWall, endToManPosition, finalEnd } =
			this.timeNode;

		let wallPositions = Helper.fourPointByOne(this.accodemtPosition, CONFIG.WALL_DISTANCE);
		wallPositions = [wallPositions.east, wallPositions.north, wallPositions.west, wallPositions.south].map((i) =>
			giveCartesian3Height(i, CONFIG.WALL_HEIGTH)
		);
		let manPositions = Helper.fourPointByOne(this.accodemtPosition, CONFIG.MAN_DISTANCE, Math.PI / 4);
		manPositions = [manPositions.east, manPositions.north, manPositions.west, manPositions.south];
		let pl = wallPositions
			.map(async (position, index) => {
				const cartesian3List = await Helper.positionFromRoutePlan(this.startPosition, position, this.tk);
				let nextTargetPosition;
				if (index === wallPositions.length - 1) {
					nextTargetPosition = wallPositions[0];
				} else {
					nextTargetPosition = wallPositions[index + 1];
				}
				const _targetPosition = position;
				const _nextTargetPosition = nextTargetPosition;
				const _manPosition = manPositions[index];

				let start_end = Helper.czmlPositionWithConstVelocity(startSendMan, endSendMan, cartesian3List);
				const packet = {
					id: "man-" + (index + 1),
					availability: Helper.czmlAvailability(startSendMan, finalEnd),
					properties: {
						_targetPosition,
						_nextTargetPosition,
						_manPosition,
					},
					position: {
						cartesian: [start_end].flat(),
					},
					orientation: {
						velocityReference: "#position",
					},
					label: {
						text: "警察",
						font: "20px sans-serif",
						showBackground: true,
						eyeOffset: {
							cartesian: [0, 7.2, 0],
						},
					},
					model: {
						gltf: "./libs/Cesium/SampleData/models/CesiumMan/Cesium_Man.glb",
						scale: 4,
						runAnimations: {
							reference: Helper.czmlReferenceCompositeValue(
								czml,
								"properties.runAnimations",
								[
									{
										interval: Helper.czmlAvailability(startSendMan, endToManPosition),
										value: true,
									},
									{
										interval: Helper.czmlAvailability(endToManPosition, finalEnd),
										value: false,
									},
								],
								"man-customProperty-" + (index + 1)
							),
						},
						heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
					},
				};
				czml.push(packet);
				return packet;
			})
			.map((promise) => {
				return promise.then((packet) => {
					const { _targetPosition, _nextTargetPosition, _manPosition } = packet.properties;
					let end_createWallEnd = Helper.czmlPositionWithConstVelocity(endSendMan, endCreateWall, [
						_targetPosition,
						_nextTargetPosition,
					]);

					let createWall_manPosition = Helper.czmlPositionWithConstVelocity(endCreateWall, endToManPosition, [
						_nextTargetPosition,
						_manPosition,
					]);

					let real_end_createWallEnd = end_createWallEnd.concat(
						[Cesium.JulianDate.toIso8601(finalEnd)].concat(
							end_createWallEnd.slice(end_createWallEnd.length - 3, end_createWallEnd.length)
						)
					);
					Helper.packetIncrementPosition(
						packet,
						end_createWallEnd,
						createWall_manPosition,
						Helper.czmlStandAt(endToManPosition, finalEnd, _manPosition, this.accodemtPosition)
					);
					Helper.packetAddWall(czml, packet, _targetPosition, real_end_createWallEnd);
					Helper.packetAddPath(czml, packet, startSendMan, endSendMan);
				});
			});
		await Promise.all(pl);
		self.czmlDataSource.load(czml).then(() => {
			Helper.setTimeCallBack(self.viewer, [
				{
					time: endToManPosition,
					handler(currentTime) {
						let entityId = ["man-1", "man-2", "man-3", "man-4"];
						entityId.forEach(async (id) => {
							let manEntity = self.czmlDataSource.entities.getById(id);
							let emitterPosition = giveCartesian3Height(
								manEntity.properties["_manPosition"]._value,
								CONFIG.WALL_HEIGTH
							);
							self.czmlBox.add(Helper.createWater(emitterPosition, self.accodemtPosition));
						});
					},
				},
			]);
		});
		console.log(czml);
		console.log(self.czmlDataSource);
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
function initTime() {}
