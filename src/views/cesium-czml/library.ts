import { CzmlTimeInterval, CzmlTimeIntervalOptions, ParticleSystemOption } from "./helper/czml";
import * as Helper from "./helper";
import CONFIG from "./config";

type CreaterOptions<T> = T & CzmlTimeIntervalOptions;
type ModelCreaterOptions = {
	packetId: string;
	cartesian: (string | number)[];
	gltf?: string;
	flashShow?: {
		start: Cesium.JulianDate;
		end: Cesium.JulianDate;
		num: number;
	};
	runAnimation?: { interval: string; value: boolean }[];
	model?: any;
	label?: any;
};
export const czmlTimeIntervalFactor = {
	point: createCreater<{
		packetId: string;
		position: Cesium.Cartesian3;
	}>((c, o) => {
		c.add({
			id: o.packetId,
			point: {
				pixelSize: 20,
				color: {
					rgba: [255, 0, 0, 255],
				},
				outlineColor: {
					rgba: [255, 255, 255, 255],
				},
				outlineWidth: 5,
			},
			position: {
				cartesian: Helper.carteain3ToList(o.position),
			},
		});
	}),
	arrow: createCreater<{
		packetId: string;
		startPosition: Cesium.Cartesian3;
		targetPosition: Cesium.Cartesian3;
		width: number;
		height: number;
	}>((c, o) => {
		c.add({
			id: o.packetId,
			polygon: {
				positions: {
					cartesian: Helper.createRectangleCoordinates(o.startPosition, o.targetPosition, o.width, o.height)
						.map(Helper.carteain3ToList)
						.flat(),
				},
				material: {
					image: {
						image: new URL("./data/arrow.png", import.meta.url).href,
						transparent: true,
					},
				},
				stRotation: Helper.angelToTargetPosition(o.startPosition, o.targetPosition) - Math.PI / 2,
			},
		});
	}),
	path: createCreater<{
		packetId: string;
		positionReference: string;
	}>((c, o) => {
		c.add({
			id: o.packetId,
			position: {
				reference: o.positionReference,
			},
			path: {
				leadTime: 2,
				trailTime: 5,
				width: 10,
				resolution: 1,
				material: {
					polylineGlow: {
						glowPower: 0.3,
						taperPower: 0.3,
						color: {
							rgba: [255, 0, 0, 255],
						},
					},
				},
			},
		});
	}),
	wall: createCreater<{
		packetId: string;
		startPosition: Cesium.Cartesian3;
		endPositions: (string | number)[];
	}>((c, o) => {
		c.add({
			id: o.packetId,
			wall: {
				positions: {
					references: [
						Helper.czmlReferenceCompositeValue(c.czml, "position", {
							cartesian: [o.startPosition.x, o.startPosition.y, o.startPosition.z],
						}),
						Helper.czmlReferenceCompositeValue(c.czml, "position", {
							cartesian: o.endPositions,
						}),
					],
				},
				material: {
					image: {
						image: new URL("../../cesium/jiaotongguanzhi1.png", import.meta.url).href,
						repeat: {
							cartesian2: Helper.czmlComputeRepeatX(
								o.startPosition,
								o.endPositions,
								CONFIG.WALL_HEIGTH,
								CONFIG.IMAGE_WIDTH,
								CONFIG.IMAGE_HEIGTH
							),
						},
						transparent: true,
					},
				},
			},
		});
	}),
	water: createCreater<{
		position: Cesium.Cartesian3;
		targetPosition: Cesium.Cartesian3;
		particleSystemOption?: ParticleSystemOption;
	}>((c, o) => {
		c.add(Helper.createWater(o.position, o.targetPosition, o.particleSystemOption), "particleSystem", false);
	}),
	fire: createCreater<{
		position: Cesium.Cartesian3;
		particleSystemOption?: ParticleSystemOption;
	}>((c, o) => {
		c.add(Helper.createFire(o.position, o.particleSystemOption), "particleSystem", false);
	}),
	cesiumMan: function (o: CreaterOptions<ModelCreaterOptions>) {
		return this.model({
			...o,
			gltf: "./libs/Cesium/SampleData/models/CesiumMan/Cesium_Man.glb",
		});
	},
	cesiumMilkTruck: function (o: CreaterOptions<ModelCreaterOptions>): CzmlTimeInterval {
		return this.model({
			...o,
			gltf: "./libs/Cesium/SampleData/models/CesiumMilkTruck/CesiumMilkTruck.glb",
			label: {
				show: false,
			},
		});
	},
	model: createCreater<ModelCreaterOptions>((c, o) => {
		c.add({
			id: o.packetId,
			position: {
				cartesian: o.cartesian,
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
				show: {
					reference: o.packetId + "-reference#properties.modeShow",
				},
				...o.label,
			},
			model: {
				gltf: o.gltf,
				scale: 4,
				show: o.flashShow
					? {
							reference: Helper.czmlFlashingShow(
								c.czml,
								"properties.modeShow",
								o.flashShow.start,
								o.flashShow.end,
								o.flashShow.num,
								o.packetId + "-reference"
							),
					  }
					: undefined,
				runAnimations: o.runAnimation
					? {
							reference: Helper.czmlReferenceCompositeValue(
								c.czml,
								"properties.runAnimations",
								o.runAnimation,
								o.packetId + "-reference"
							),
					  }
					: undefined,
				heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
				...o.model,
			},
		});
	}),
};

export function createCreater<Z extends any, T = CreaterOptions<Z>>(
	cb: (czmlTimeInterval: CzmlTimeInterval, createrOptions: T) => void
) {
	return (options: T) => {
		let news = new CzmlTimeInterval(options as unknown as CzmlTimeIntervalOptions);
		cb(news, options);
		return news;
	};
}
