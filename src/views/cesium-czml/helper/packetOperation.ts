import * as PropertyCo from "./propertyCompute";
import CONFIG from "../config";

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
export function packetAddMan(packet,start,end,startPosition,endPositoin){
	
}
export function packetIncrementPosition(packet, ...cartesianList) {
	cartesianList.forEach((_cartesianList) => {
		packet.position.cartesian = packet.position.cartesian.concat(..._cartesianList);
	});
}
