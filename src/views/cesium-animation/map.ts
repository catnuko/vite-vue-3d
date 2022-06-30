import axios from "axios";
import { cameraFlyTo, debugPosition } from "ht-cesium-utils";
import * as Helper from "../cesium-czml/helper";
import { CesiumFeatureLayer, CesiumFeature } from "ht-layers";
const viewLibrary = {
	china: {
		destination: [-3605512.105699924, 26686989.936434574, 10998431.27978446],
		hpr: [6.283185307179586, -1.5694775890277204, 0],
	},
	sswh: {
		destination: [-2815634.9655012125, 4885491.891794013, 3098215.2354594874],
		hpr: [6.283185307178744, -0.7854092651685538, 6.283185307179572],
	},
};
function setCesiumFeatureLayerAvaliability(cesiumFeatuerLayer: CesiumFeatureLayer, timeInterval: Cesium.TimeInterval) {
	forEachEntity(cesiumFeatuerLayer, (entity) => {
		entity.availability = new Cesium.TimeIntervalCollection([timeInterval]);
	});
}
function forEachEntity(cesiumFeatuerLayer: CesiumFeatureLayer, cb: (entity: Cesium.Entity) => void) {
	cesiumFeatuerLayer.cesiumFeatureMap.values.forEach((i: CesiumFeature) => {
		let entities = i.getEntities();
		entities.forEach(cb);
	});
}
function flyToCesiumFeatureLayer(viewer: Cesium.Viewer, cesiumFeatureLayer: CesiumFeatureLayer) {
	viewer.flyTo(cesiumFeatureLayer.dataSource);
}
export class MapShow {
	viewer: Cesium.Viewer;
	guoJiaRangeLayer: CesiumFeatureLayer;
	shengRangeLayer: CesiumFeatureLayer;
	rangeLayer: CesiumFeatureLayer;
	constructor(viewer) {
		this.viewer = viewer;
		// 是否支持图像渲染像素化处理
		if (Cesium.FeatureDetection.supportsImageRenderingPixelated()) {
			viewer.resolutionScale = window.devicePixelRatio;
		}
		// 开启抗锯齿
		viewer.scene.postProcessStages.fxaa.enabled = true;

		console.log(viewer);
		debugPosition(viewer);
		this.init();
	}
	async initData() {
		let p,
			pl = [];
		let guoJiaUrl = "https://geo.datav.aliyun.com/areas_v3/bound/100000_full.json";
		p = axios.get(guoJiaUrl).then((res) => {
			this.guoJiaRangeLayer = new CesiumFeatureLayer(this.viewer, "中国范围");
			this.guoJiaRangeLayer.show = true;
			this.guoJiaRangeLayer.setFeatureCollection(res.data, {
				style: () => {
					return {
						strokeColor: "#ffc922",
						strokeOpacity: 1,
						strokeWidth: 3,
						outline: true,
						fillColor: "#ffc922",
						fillOpacity: 0.01,
					};
				},
				focusStyle: () => {
					return {
						strokeColor: "#ffc922",
						strokeOpacity: 1,
						strokeWidth: 3,
						outline: true,
						fillColor: "#ffc922",
						fillOpacity: 0.2,
					};
				},
				id(i) {
					return i.adcode;
				},
			});
		});
		pl.push(p);
		let shengUrl = "https://geo.datav.aliyun.com/areas_v3/bound/330000_full.json";
		p = axios.get(shengUrl).then((res) => {
			this.shengRangeLayer = new CesiumFeatureLayer(this.viewer, "浙江省范围");
			this.shengRangeLayer.show = false;
			this.shengRangeLayer.setFeatureCollection(res.data, {
				style: () => {
					return {
						strokeColor: "#ffc922",
						strokeOpacity: 1,
						strokeWidth: 3,
						outline: true,
						fillColor: "#ffc922",
						fillOpacity: 0.2,
					};
				},
				focusStyle: () => {
					return {
						strokeColor: "#ffc922",
						strokeOpacity: 1,
						strokeWidth: 3,
						outline: true,
						fillColor: "#ffc922",
						fillOpacity: 0.2,
					};
				},
				id(i) {
					return i.adcode;
				},
			});
		});
		pl.push(p);
		let url = "https://geo.datav.aliyun.com/areas_v3/bound/330700_full.json";
		p = axios.get(url).then((res) => {
			this.rangeLayer = new CesiumFeatureLayer(this.viewer, "上山文化流域范围");
			this.rangeLayer.show = false;
			this.rangeLayer.setFeatureCollection(res.data, {
				style: () => {
					return {
						strokeColor: "#ffc922",
						strokeOpacity: 1,
						strokeWidth: 3,
						outline: true,
						fillColor: "#ffc922",
						fillOpacity: 0.2,
					};
				},
				focusStyle: () => {
					return {
						strokeColor: "#ffc922",
						strokeOpacity: 1,
						strokeWidth: 3,
						outline: true,
						fillColor: "#ffc922",
						fillOpacity: 0.2,
					};
				},
				id(i) {
					return i.adcode;
				},
			});
		});
		pl.push(p);
		let xianUrl = "https://geo.datav.aliyun.com/areas_v3/bound/330726.json";
		p = axios.get(xianUrl).then((res) => {
			this.rangeLayer = new CesiumFeatureLayer(this.viewer, "浦江县范围");
			this.rangeLayer.show = false;
			this.rangeLayer.setFeatureCollection(res.data, {
				style: () => {
					return {
						strokeColor: "#ffc922",
						strokeOpacity: 1,
						strokeWidth: 3,
						outline: true,
						fillColor: "#ffc922",
						fillOpacity: 0.2,
					};
				},
				focusStyle: () => {
					return {
						strokeColor: "#ffc922",
						strokeOpacity: 1,
						strokeWidth: 3,
						outline: true,
						fillColor: "#ffc922",
						fillOpacity: 0.2,
					};
				},
				id(i) {
					return i.adcode;
				},
			});
		});
		pl.push(p);
		return Promise.all(pl);
	}
	async init() {
		await this.initData();
		let start = Cesium.JulianDate.addSeconds(Cesium.JulianDate.now(), 3, new Cesium.JulianDate());
		let [startShowGuoJia, startShowLabel, startShowOtherLabel, startShowSheng, startShowRange, startFlyToSSWH] =
			Helper.incrementJulianDateList(start, [
				0, //地球转到正面时就显示国家范围
				3, //转动停止后显示上山文化遗址图标
				1, //显示其它文化遗址
				3, //3秒后显示浙江省范围，关闭国家范围
				3, //3秒后飞向上山文化流域范围，暂用金华范围代替,关闭浙江省范围
				3, //3秒后飞向上山文化遗址
			]);
		let end = Cesium.JulianDate.addHours(start, 1, new Cesium.JulianDate());
		this.viewer.clock.startTime = start;
		this.viewer.clock.stopTime = end;
		this.viewer.clock.currentTime = start;
		// setCesiumFeatureLayerAvaliability(
		// 	this.guoJiaRangeLayer,
		// 	new Cesium.TimeInterval({ start: startShowGuoJia, stop: startShowSheng })
		// );
		// setCesiumFeatureLayerAvaliability(
		// 	this.shengRangeLayer,
		// 	new Cesium.TimeInterval({ start: startShowSheng, stop: startShowRange })
		// );
		// setCesiumFeatureLayerAvaliability(
		// 	this.rangeLayer,
		// 	new Cesium.TimeInterval({ start: startShowRange, stop: startFlyToSSWH })
		// );
		// this.guoJiaRangeLayer.show = true;
		// this.shengRangeLayer.show = true;
		// this.rangeLayer.show = true;
		let t1 = new Helper.CzmlTimeInterval({
			start: startShowGuoJia,
			end: startShowSheng,
			view: {
				destination: [-4142602.3874134514, 10801666.334968975, 7015166.943399901],
				hpr: [6.203578779318259, -1.562059667460335, 0],
			},
		});
		t1.addState({
			state: {},
			onTimeChange: (state, isContain) => {
				if (isContain) {
					this.guoJiaRangeLayer.show = true;
				} else {
					this.guoJiaRangeLayer.show = false;
				}
				return state;
			},
		});
		let t2 = new Helper.CzmlTimeInterval({ start: startShowSheng, end: startShowRange });
		t2.addState({
			state: {},
			onTimeChange: (state, isContain) => {
				if (isContain) {
					this.shengRangeLayer.show = true;
					this.viewer.flyTo(this.shengRangeLayer.dataSource);
				} else {
					this.shengRangeLayer.show = false;
				}
				return state;
			},
		});
		let t3 = new Helper.CzmlTimeInterval({ start: startShowRange, end: startFlyToSSWH });
		t3.addState({
			state: {},
			onTimeChange: (state, isContain) => {
				if (isContain) {
					this.rangeLayer.show = true;
					this.viewer.flyTo(this.rangeLayer.dataSource);
				} else {
					this.rangeLayer.show = false;
				}
				return state;
			},
		});
		//设置时间
		const showLabel = new Helper.CzmlTimeInterval({ start: startShowLabel, end: end });
		showLabel.add({
			id: "sswh-label",
			position: {
				cartographicDegrees: [119.98191, 29.458741, 100],
			},
			point: {
				pixelSize: 20,
				color: {
					rgba: [255, 255, 255, 255],
				},
				outlineColor: {
					rgba: [255, 0, 0, 255],
				},
				outlineWidth: 5,
			},
			label: {
				pixelOffset: {
					cartesian2: [0, -40],
				},
				text: "上山文化遗址",
				fillColor: {
					rgba: [255, 255, 0, 255],
				},
			},
		});
		let show = new Helper.CzmlTimeIntervalShow([
			showLabel,
			t1,
			t2,
			t3,
			// Helper.createView(start, viewLibrary.china),
			// Helper.createView(startFlyToSSWH, viewLibrary.sswh),
		]);
		show.setViewer(this.viewer);
	}
}
