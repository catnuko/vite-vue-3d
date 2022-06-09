import WorkFlow from "./WorkFlow";
import * as Helper from "./helper";
import CONFIG from "./config";
import { giveCartesian3Height } from "ht-cesium-utils";

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
	}
	_sendMan() {}
}
