import WorkFlow from "./WorkFlow";
import Box from "./Box";
import * as Helper from "./helper";
import CONFIG from "./config";

import { CzmlTimeInterval, CzmlTimeIntervalShow } from "./helper/czml";
import { giveCartesian3Height } from "ht-cesium-utils";
import { czmlTimeIntervalFactor } from "./library";
export default class TrafficWorkFlow extends WorkFlow {
	constructor(viewer, title, tk) {
		super(viewer, title, tk);
		this.startPlace = "湖州市德清县武康镇武源街125号";
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
	loadCzml() {
		let startAccident = this.accidentTime;
		let [startShowMan, endShowMan] = Helper.incrementJulianDateList(startAccident, [5, 3]);
		let [startCar, endCar] = Helper.incrementJulianDateList(startAccident, [5, 2]);
		const finalEnd = Cesium.JulianDate.addMinutes(startAccident, 60, new Cesium.JulianDate());
		this.timeNode = {
			startAccident,
			startShowMan,
			endShowMan,
			startCar,
			endCar,
			finalEnd,
		};
		this.viewer.timeline.zoomTo(startAccident, finalEnd);
		let manPositions = Helper.fourPointByOne(this.accodemtPosition, CONFIG.MAN_DISTANCE, Math.PI / 4);
		manPositions = [manPositions.east, manPositions.north, manPositions.west, manPositions.south].map((i) =>
			giveCartesian3Height(i, 3)
		);
		const allAnimation = czmlTimeIntervalFactor.point({
			start: startAccident,
			end: finalEnd,
			packetId: "all-animation",
			position: giveCartesian3Height(this.accodemtPosition, 3),
		});
		const showMan = czmlTimeIntervalFactor.cesiumMan({
			start: startShowMan,
			end: finalEnd,
			view: {
				destination: [-2746801.160400554, 4763651.357878603, 3220910.967226206],
				hpr: [0.2741199786935695, -0.4688640631721803, 6.283182631305866],
			},
			packetId: "cesium-man",
			flashShow: {
				start: startShowMan,
				end: endShowMan,
				num: 3,
			},
			runAnimation: [
				{
					interval: Helper.czmlAvailability(startShowMan, finalEnd),
					value: false,
				},
			],
			cartesian: Helper.czmlStandAt(startShowMan, finalEnd, manPositions[0], this.accodemtPosition).flat(),
		});
		const showArrow = czmlTimeIntervalFactor.arrow({
			start: startShowMan,
			end: finalEnd,
			packetId: "polygon-arrow",
			startPosition: manPositions[0],
			targetPosition: this.accodemtPosition,
			width: 15,
			height: 30,
		});
		let routeStart = new Cesium.Cartesian3(-2746405.490254636, 4763709.960392949, 3221029.616567649);
		let routeEnd = new Cesium.Cartesian3(-2746761.983665834, 4763523.009378105, 3221002.299741689);
		const showCar = czmlTimeIntervalFactor.cesiumMilkTruck({
			start: startShowMan,
			end: finalEnd,
			view: {
				destination: [-2746883.9398130616, 4764029.076858764, 3220745.795831372],
				hpr: [0.03178201323834884, -0.5443254884307507, 0.0000049969134128247106],
			},
			packetId: "cesium-milkcar",
			cartesian: [
				...Helper.czmlPositionWithAccelerateVelocity(startCar, endCar, [routeStart, routeEnd]),
				...Helper.czmlStandAt(endCar, finalEnd, routeEnd, this.accodemtPosition).flat(),
			],
		});

		let shower = new CzmlTimeIntervalShow([allAnimation, showMan, showArrow, showCar]);
		shower.setClock({
			currentTime: Cesium.JulianDate.toIso8601(startAccident),
			multiplier: 1,
			interval: Helper.czmlAvailability(startAccident, finalEnd),
		});
		shower.setViewer(this.viewer);
	}
}
