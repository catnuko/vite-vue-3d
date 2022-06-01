import { CZML } from "./czml/CZML";
import { Packet } from "./czml/Packet";
import { Dayjs, dayjs } from "./czml/dayjs";
import * as CZMLUtils from "./czml/utils";
let start = dayjs();
let end = dayjs().add(1, "minutes");
export class MapShow {
	czml: string;
	dataSourceMap = {};
	constructor(readonly viewer: Cesium.Viewer) {
		this.viewer.clock.shouldAnimate = true;
		this.init();
	}
	async init() {
		let newPacket = await CZMLUtils.makeRoutePacket({
			id: "routePacket",
			start: {
				time: start,
				place: "浙江省湖州市德清县科源路15号",
			},
			end: {
				time: end,
				place: "浙江省湖州市德清县武康街道五里牌路70号",
			},
			billboardGraphic: {
				image: "resources/location.png",
				verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
				horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
			},
			polylineGraphic: {
				material: new Cesium.PolylineOutlineMaterialProperty({
					color: Cesium.Color.RED,
					outlineColor: Cesium.Color.BLACK,
					outlineWidth: 2,
				}),
				width: 20,
			},
			tk: "1292dbbb36f799c61eabc3c732eef02c",
		});
		new CZML().name("测试routePacket").add(newPacket).setViewer(this.viewer).flyTo();
	}
	destroy() {}
}
