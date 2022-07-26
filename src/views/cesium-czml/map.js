import { CZML } from "./czml/CZML";
import { Packet } from "./czml/Packet";
import { dayjs } from "./czml/dayjs";
import * as RoutePlan from "./czml/routePlan";
import { debugPosition, cameraFlyTo } from "ht-cesium-utils";
import { createWorkFlow } from "./WorkFlowFactory";
import { mitter, EVENT } from "./mitt";

let start = dayjs();
let end = dayjs().add(1, "minutes");
const tk = "7a801d6cd03da3cc229d90a6c8897e2a";
export class MapShow {
	constructor(viewer) {
		this.viewer = viewer;
		console.log(viewer);
		debugPosition(viewer);
		this.viewer.clock.shouldAnimate = true;
		this.view = {
			position: new Cesium.Cartesian3(-2749967.3613733617, 4768095.421715767, 3219583.245407451),
			hpr: new Cesium.HeadingPitchRoll(6.283185307179354, -0.7854090590265459, 6.283185307179585),
		};
		this.viewer.clock.shouldAnimate = true;
		this.workFlowList = [];
		cameraFlyTo(viewer, this.view.position, this.view.hpr);
		mitter.on(EVENT.WORKFLOW_EVENT, ({ item }) => {
			console.log(tk);
			const workFlow = createWorkFlow(this.viewer, item.name, tk);
			workFlow.setAccident(item.position, Cesium.JulianDate.now(), {
				position: new Cesium.Cartesian3(-2746941.103456469, 4763779.777781569, 3220882.9237362673),
				hpr: new Cesium.HeadingPitchRoll(0.0873333136501282, -0.7927246054726362, 6.28318503262281),
			});
			// workFlow.sendMan();
			workFlow.loadCzml();

			this.workFlowList.push(workFlow);
			mitter.emit(EVENT.PANEL_SHOW_ADD_WORKFLOW, {
				title: workFlow.title,
				steps: workFlow.steps,
			});
		});
	}
	start() {
		this.startTime = dayjs();
		this.endTime = this.startTime.add(this.duration);
		this.viewer.clock.startTime = this.startTime;
		this.viewer.clock.currentTime = this.startTime;
		this.viewer.clock.multiplier = 1;
		this.viewer.clock.stopTime = this.endTime;
		this.viewer.clock.canAnimate = true;
		this.viewer.clock.shouldAnimate = true;
	}
	addDuration(seconds) {
		if (!this.duration) {
			this.duration = dayjs.duration(seconds, "s");
		} else {
			this.duration.add(seconds, "s");
		}
	}

	async init() {
		const startPRes = await RoutePlan.getPlaceLocation("浙江省湖州市德清县科源路15号", tk);
		const startP = [startPRes.lon, startPRes.lat];
		const endPRes = await RoutePlan.getPlaceLocation("浙江省湖州市德清县武康街道五里牌路70号", tk);
		const endP = [endPRes.lon, endPRes.lat];
		const routes = await RoutePlan.getRouteFromLonlat(startP, endP, tk);
		let route = routes[0];
		new CZML()
			.name("测试routePacket")
			.add(
				new Packet({
					id: "routePacket",
				})
					.billboard(
						new Cesium.BillboardGraphics({
							image: "resources/location.png",
							verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
							horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
						})
					)
					.position({
						startTime: start,
						endTime: end,
						positions: route.cartesian3List,
					})
					.cb((self) => {
						self.viewFrom = {
							cartesian: [4.3, 0.1, 2.6],
						};
						self.packet.path = {
							show: true,
							leadTime: 2,
							trailTime: 60,
							width: 10,
							resolution: 1,
							material: new Cesium.PolylineGlowMaterialProperty({
								glowPower: 0.3,
								taperPower: 0.3,
								color: Cesium.Color.PALEGOLDENROD,
							}),
						};
					})
			)
			.setViewer(this.viewer);
	}
	destroy() {}
}
