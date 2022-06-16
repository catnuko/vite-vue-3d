import { cartesian32LonLat, giveCartesian3Height } from "ht-cesium-utils";
import * as EntityOp from "./entityOperation";
import * as PropertyCo from "./propertyCompute";
import CONFIG from "../config";
import * as RoutePlan from "../czml/routePlan";

/**
 * 动态的创建一个墙
 */
export function createWallAroundPointDynamicly(start, end, startPosition, endPosition) {
	let position = PropertyCo.positionWithConstVelocity(start, end, [startPosition, endPosition]);
	return createDynamicWall((time) => {
		let curPosition = position.getValue(time);
		if (curPosition) {
			return [startPosition, curPosition];
		} else {
			return [startPosition, position.getValue(end)];
		}
	});
}
/**
 * 创建一个动态设置位置的墙
 */
export function createDynamicWall(positionUpdater) {
	let repeatX = 1;
	return new Cesium.Entity({
		wall: {
			positions: new Cesium.CallbackProperty((time) => {
				let newPositions = positionUpdater(time);
				newPositions = newPositions.map((i) => giveCartesian3Height(i, CONFIG.WALL_HEIGTH));
				repeatX = PropertyCo.computeRepeatX(newPositions, CONFIG.WALL_HEIGTH, CONFIG.IMAGE_WIDTH, CONFIG.IMAGE_HEIGTH);
				return newPositions;
			}, false),
			material: new Cesium.ImageMaterialProperty({
				image: new URL("../../cesium/jiaotongguanzhi1.png", import.meta.url).href,
				repeat: new Cesium.CallbackProperty(() => {
					return new Cesium.Cartesian2(repeatX, 1);
				}, false),
				transparent: true,
			}),
		},
	});
}
export function createMan(position) {
	const modelLabel = new Cesium.Entity({
		position: position,
		orientation: position instanceof Cesium.Cartesian3 ? undefined : new Cesium.VelocityOrientationProperty(position), // Automatically set the model's orientation to the direction it's facing.
		label: {
			text: "警察",
			font: "20px sans-serif",
			showBackground: true,
			// distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0.0, 100.0),
			eyeOffset: new Cesium.Cartesian3(0, 7.2, 0),
		},
		model: {
			uri: "./libs/Cesium/SampleData/models/CesiumMan/Cesium_Man.glb",
			scale: 4,
			heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
		},
		path: {
			leadTime: 2,
			trailTime: 60,
			width: 10,
			resolution: 1,
			material: new Cesium.PolylineGlowMaterialProperty({
				glowPower: 0.3,
				taperPower: 0.3,
				color: Cesium.Color.RED,
			}),
		},
		properties: {},
	});
	return modelLabel;
}
export async function createManByRoutePlan(start, end, startPosition, endPosition, tk) {
	let startP = cartesian32LonLat(startPosition);
	let endP = cartesian32LonLat(endPosition);
	const routes = await RoutePlan.getRouteFromLonlat([startP.lon, startP.lat], [endP.lon, endP.lat], tk);
	const cartesian3List = routes[0].cartesian3List;
	const positions = PropertyCo.positionWithConstVelocity(start, end, cartesian3List);
	return createMan(positions);
}

export function wallAroundPoint(position, distance, rotation = 0) {
	let { east, west, north, south } = PropertyCo.fourPointByOne(position, distance, rotation);
	let positions = [east, north, west, south, east];
	const repeatX = PropertyCo.computeRepeatX(positions, CONFIG.WALL_HEIGTH, CONFIG.IMAGE_WIDTH, CONFIG.IMAGE_HEIGTH);
	let t = positions.map((i) => giveCartesian3Height(i, CONFIG.WALL_HEIGTH));
	console.log(positions);
	console.log(t);
	return new Cesium.Entity({
		wall: {
			positions: t,
			material: new Cesium.ImageMaterialProperty({
				image: new URL("../../cesium/jiaotongguanzhi1.png", import.meta.url).href,
				repeat: new Cesium.Cartesian2(repeatX, 1),
				transparent: true,
			}),
		},
		properties: {},
	});
}
export function createWater(position, targetPositon, options) {
	return new Cesium.ParticleSystem({
		image: "./libs/Cesium/SampleData/circular_particle.png",
		startColor: new Cesium.Color(0.27, 0.5, 0.7, 0.0),
		endColor: new Cesium.Color(0.8, 0.8, 0.8, 0.98),
		startScale: 1,
		endScale: 2,
		minimumParticleLife: 6,
		maximumParticleLife: 7,
		minimumSpeed: 9,
		maximumSpeed: 9.5,
		imageSize: new Cesium.Cartesian2(1, 2),
		emissionRate: 15, //每秒要发射的粒子数
		lifetime: 160.0, //粒子系统发射粒子的时间（以秒为单位）
		emitter: new Cesium.CircleEmitter(0.5),
		emitterModelMatrix: PropertyCo.emitterModelMatrixOfWater(position, targetPositon),
		modelMatrix: Cesium.Transforms.eastNorthUpToFixedFrame(position),
		sizeInMeters: true,
		speed: 12,
		updateCallback: (p, dt) => {
			const gravityScratch = new Cesium.Cartesian3();
			Cesium.Cartesian3.normalize(p.position, gravityScratch);
			Cesium.Cartesian3.multiplyByScalar(gravityScratch, -3.5 * dt, gravityScratch);
			p.velocity = Cesium.Cartesian3.add(p.velocity, gravityScratch, p.velocity);
		},
		...options,
	});
}

export function createFire(position, options) {
	return new Cesium.ParticleSystem({
		image: new URL("../data/fire.png", import.meta.url).href,
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
		...options,
	});
}
