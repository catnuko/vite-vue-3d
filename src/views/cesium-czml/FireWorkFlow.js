import WorkFlow from "./WorkFlow";
import * as Helper from "./helper";
import CONFIG from "./config";
import { lineString, length } from "@turf/turf";
import { cartesian32LonLat } from "ht-cesium-utils";
export default class FireWorkFlow extends WorkFlow {
	constructor(viewer, title, tk) {
		super(viewer, title, tk);
		this.startPlace = "湖州市德清县武康镇北湖东街717号";
	}
	_setAccident(position, time, view) {
		const accidentPrimitive = new Cesium.ParticleSystem({
			image: new URL("./data/fire.png", import.meta.url).href,
			startColor: Cesium.Color.RED.withAlpha(0.7),
			endColor: Cesium.Color.YELLOW.withAlpha(0.3),
			startScale: 1,
			endScale: 10,
			minimumParticleLife: 1,
			maximumParticleLife: 6,
			minimumSpeed: 1,
			maximumSpeed: 4,
			imageSize: new Cesium.Cartesian2(5, 5),
			emissionRate: 4, //每秒要发射的粒子数
			lifetime: 160.0, //粒子系统发射粒子的时间（以秒为单位）
			emitter: new Cesium.CircleEmitter(5.0),
			modelMatrix: Cesium.Transforms.eastNorthUpToFixedFrame(position),
		});
		this.accidentBox.add(accidentPrimitive);
		let entity = wallAroundPoint(position, CONFIG.WALL_DISTANCE);
		this.viewer.entities.add(entity);
		// this.accidentBox.add();
	}
	_sendMan() {}
}
function wallAroundPoint(position, distance, rotation = 0) {
	let { east, west, north, south } = Helper.fourPointByOne(position, distance, rotation);
	let positions = [east, north, west, north];
	let HEIGHT = 20;
	let IMAGE_WIDTH = 991;
	let IMAGE_HEIGTH = 394;
	const repeatX = Helper.computeRepeatX(HEIGHT, IMAGE_WIDTH, IMAGE_HEIGTH);
	return new Cesium.Entity({
		wall: {
			positions: positions,
			material: new Cesium.ImageMaterialProperty({
				image: new URL("../cesium/jiaotongguanzhi1.png", import.meta.url).href,
				repeat: new Cesium.Cartesian2(repeatX, 1),
				transparent: true,
			}),
		},
		properties: {},
	});
}
