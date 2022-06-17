import WorkFlow from "./WorkFlow";
import * as Helper from "./helper";
import CONFIG from "./config";
import { giveCartesian3Height } from "ht-cesium-utils";
import { czmlTimeIntervalFactor } from "./library";
import { CzmlTimeIntervalShow } from "./helper/czml";

export default class FireWorkFlow extends WorkFlow {
	constructor(viewer, title, tk) {
		super(viewer, title, tk);
		this.startPlace = "湖州市德清县武康镇北湖东街717号";
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
	async beforeCzml() {
		this.czml = [
			{
				id: "document",
				version: "1.0",
			},
		];
		//初始化时间
		const startAccident = this.accidentTime;
		const [startSendMan, currentTime, endSendMan, endCreateWall, endToManPosition, endAccident] =
			Helper.incrementJulianDateList(startAccident, [5, 58, 2, 5, 2, 5]);
		const finalEnd = Cesium.JulianDate.addMinutes(startAccident, 60, new Cesium.JulianDate());
		this.timeNode = {
			startAccident,
			startSendMan,
			currentTime,
			endSendMan,
			endCreateWall,
			endToManPosition,
			endAccident,
			finalEnd,
		};
		this.viewer.timeline.zoomTo(startAccident, finalEnd);
		if (!this.startPosition) {
			await this.initStartPosition();
		}
	}
	destroyCzml() {
		this.viewDestroyHandle && this.viewDestroyHandle();
	}
	async loadCzml() {
		const self = this;
		await this.beforeCzml();
		const {
			startAccident,
			startSendMan,
			currentTime,
			endSendMan,
			endCreateWall,
			endToManPosition,
			endAccident,
			finalEnd,
		} = this.timeNode;

		let wallPositions = Helper.fourPointByOne(this.accodemtPosition, CONFIG.WALL_DISTANCE);
		wallPositions = [wallPositions.east, wallPositions.north, wallPositions.west, wallPositions.south].map((i) =>
			giveCartesian3Height(i, CONFIG.WALL_HEIGTH)
		);
		let manPositions = Helper.fourPointByOne(this.accodemtPosition, CONFIG.MAN_DISTANCE, Math.PI / 4);
		manPositions = [manPositions.east, manPositions.north, manPositions.west, manPositions.south];

		let dataPl = wallPositions.map(async (pEndRoute, index) => {
			let pEndCreateWall;
			if (index === wallPositions.length - 1) {
				pEndCreateWall = wallPositions[0];
			} else {
				pEndCreateWall = wallPositions[index + 1];
			}
			let pEndBackFire = manPositions[index];
			const route = await Helper.positionFromRoutePlan(this.startPosition, pEndRoute, this.tk);
			const psRoute = Helper.czmlPositionWithConstVelocity(startSendMan, endSendMan, route);
			const psCreateWall = Helper.czmlPositionWithConstVelocity(endSendMan, endCreateWall, [pEndRoute, pEndCreateWall]);
			const psBackFire = Helper.czmlPositionWithConstVelocity(endCreateWall, endToManPosition, [
				pEndCreateWall,
				pEndBackFire,
			]);
			const PsRealCreateWall = psCreateWall.concat(
				[Cesium.JulianDate.toIso8601(finalEnd)].concat(psCreateWall.slice(psCreateWall.length - 3, psCreateWall.length))
			);
			return {
				route: route,
				pEndCreateWall,
				pEndRoute,
				pEndBackFire,
				psCreateWall,
				psBackFire,
				psRoute,
				PsRealCreateWall,
			};
		});
		let locationList = await Promise.all(dataPl);
		let tiHasFire = czmlTimeIntervalFactor.fire({
			start: startAccident,
			end: endAccident,
			packetId: "accident-point",
			position: this.accodemtPosition,
		});
		tiHasFire.setView({
			destination: [-2746801.160400554, 4763651.357878603, 3220910.967226206],
			hpr: [0.2741199786935695, -0.4688640631721803, 6.283182631305866],
			time: {
				offset: [-3, 0],
				unit: "seconds",
			},
		});
		let timeIntervalList = locationList.map((location, index) => {
			let tiManRoute = czmlTimeIntervalFactor.cesiumMan({
				start: startSendMan,
				end: endAccident,
				packetId: "man-" + index,
				cartesian: location.psRoute.concat(
					location.psCreateWall,
					location.psBackFire,
					Helper.czmlStandAt(endToManPosition, endAccident, location.pEndBackFire, this.accodemtPosition).flat()
				),
				runAnimation: [
					{
						interval: Helper.czmlAvailability(startSendMan, endToManPosition),
						value: true,
					},
					{
						interval: Helper.czmlAvailability(endToManPosition, finalEnd),
						value: false,
					},
				],
			});
			let tiPath = czmlTimeIntervalFactor.path({
				start: startSendMan,
				end: endSendMan,
				packetId: "man-path-" + index,
				positionReference: "man-" + index + "#position",
			});
			let tiWallCreateWall = czmlTimeIntervalFactor.wall({
				start: endSendMan,
				end: endAccident,
				packetId: "man-wall-" + index,
				startPosition: location.pEndRoute,
				endPositions: location.PsRealCreateWall,
			});
			let tiWalter = czmlTimeIntervalFactor.water({
				start: endToManPosition,
				end: endAccident,
				position: location.pEndBackFire,
				targetPosition: this.accodemtPosition,
			});

			return [tiManRoute, tiPath, tiWallCreateWall, tiWalter];
		});
		let shower = new CzmlTimeIntervalShow([tiHasFire].concat(timeIntervalList.flat()));
		shower.setClock({
			currentTime: Cesium.JulianDate.toIso8601(currentTime),
			multiplier: 1,
			interval: Helper.czmlAvailability(startAccident, finalEnd),
		});
		shower.setViewer(this.viewer);
	}
}
