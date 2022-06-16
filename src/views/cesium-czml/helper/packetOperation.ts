import * as PropertyCo from "./propertyCompute";
import CONFIG from "../config";
import { v4 as uuidv4 } from "uuid";

export function packetAddPath(czml, packet, start, end) {
	let id = packet.id;
	let pathId = id + "-path";
	czml.push({
		id: pathId,
		availability: PropertyCo.czmlAvailability(start, end),
		position: {
			reference: id + "#position",
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
}
export function packetAddWall(czml, packet, startPosition, endPositions) {
	packet.wall = {
		//动态变化的墙的位置用引用设置
		positions: {
			references: [
				PropertyCo.czmlReferenceCompositeValue(czml, "position", {
					cartesian: [startPosition.x, startPosition.y, startPosition.z],
				}),
				PropertyCo.czmlReferenceCompositeValue(czml, "position", {
					cartesian: endPositions,
				}),
			],
		},
		material: {
			image: {
				image: new URL("../../cesium/jiaotongguanzhi1.png", import.meta.url).href,
				repeat: {
					cartesian2: PropertyCo.czmlComputeRepeatX(
						startPosition,
						endPositions,
						CONFIG.WALL_HEIGTH,
						CONFIG.IMAGE_WIDTH,
						CONFIG.IMAGE_HEIGTH
					),
				},
				transparent: true,
			},
		},
	};
}
export function packetIncrementPosition(packet, ...cartesianList) {
	cartesianList.forEach((_cartesianList) => {
		packet.position.cartesian = packet.position.cartesian.concat(..._cartesianList);
	});
}
export function clone(obj) {
	return Object.assign({}, obj);
}
export function packetAddArrow(czml, startPosition, endPosition, width, height, packetId = uuidv4()) {
	let newPacket = getPacket(czml, packetId);
	newPacket.polygon = {
		positions: {
			cartesian: PropertyCo.createRectangleCoordinates(startPosition, endPosition, width, height)
				.map(PropertyCo.carteain3ToList)
				.flat(),
		},
		material: {
			image: {
				image: new URL("../data/arrow.png", import.meta.url).href,
				transparent: true,
			},
		},
		stRotation: PropertyCo.angelToTargetPosition(startPosition, endPosition) - Math.PI / 2,
	};
	return newPacket;
}
/**
 * packetId指定的packet不存在则创建新的packet
 */
export function getPacket(czml, packetId) {
	let packet = czml.find((p) => p.id === packetId);
	if (packet) {
		return packet;
	} else {
		let packet = {
			id: packetId,
		};
		czml.push(packet);
		return packet;
	}
}
export function checkPacketProperty(czml, packet, property) {
	let innerPacket;
	if (packet[property]) {
		innerPacket = { id: uuidv4() };
		czml.push(innerPacket);
	} else {
		innerPacket = packet;
	}
	return innerPacket;
}
