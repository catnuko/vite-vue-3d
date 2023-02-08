import { Operation } from "ht-components";
import { cartesian32LonLat, giveCartesian3Height } from "ht-cesium-utils";
import { length, lineString } from "@turf/turf";
export class MapShow {
	constructor(private readonly viewer: Cesium.Viewer) {
		// this.viewer.camera.setView({
		// 	destination: new Cesium.Cartesian3(-2802781.396485012, 4870404.471191286, 3165503.550263197),
		// 	orientation: {
		// 		heading: 6.283185307179582,
		// 		pitch: -1.568711439472004, // default value (looking down)
		// 		roll: 0.0,
		// 	},
		// });

		// let operation = new Operation({ viewer });
		// operation.interaction.draw("polyline").then((res: Cesium.Cartesian3[]) => {
		// 	let HEIGHT = 20;
		// 	let IMAGE_WIDTH = 991;
		// 	let IMAGE_HEIGTH = 394;
		// 	let lineLength = length(
		// 		lineString(
		// 			res.map((x) => {
		// 				let _x = cartesian32LonLat(x);
		// 				return [_x.lon, _x.lat];
		// 			})
		// 		),
		// 		{
		// 			units: "meters",
		// 		}
		// 	);
		// 	let shouldWidth = (IMAGE_WIDTH / IMAGE_HEIGTH) * HEIGHT;
		// 	let repeatX = Math.ceil(lineLength / shouldWidth);
		// 	viewer.entities.add(
		// 		new Cesium.Entity({
		// 			wall: {
		// 				positions: res.map((x) => giveCartesian3Height(x, HEIGHT)),
		// 				material: new Cesium.ImageMaterialProperty({
		// 					image: new URL("./jiaotongguanzhi1.png", import.meta.url).href,
		// 					repeat: new Cesium.Cartesian2(repeatX, 1),
		// 					transparent: true,
		// 				}),
		// 			},
		// 		})
		// 	);
		// });
		let json= [
			{
			  coordinates: [123, 23, 0],
			  name: '图标1',
			},
			{
			  coordinates: [123, 23.001, 0],
			  name: '图标2',
			},
			{
			  coordinates: [123, 23.002, 0],
			  name: '图标3',
			},
		  ]
	  
		  let marks = []
	  
		  for (let item of json) {
			marks.push({
			  position: Cesium.Cartographic.toCartesian(
				Cesium.Cartographic.fromDegrees(...item.coordinates)
			  ),
			  text: item.name,
			  height: 50,
			  imagData: {
				topIcon: new URL('./mark_header.png',import.meta.url).href, // 文字旁边的图标
				bodyIcon: new URL('./mark_line.png',import.meta.url).href, // 竖着的条
				backIcon: new URL('./mark_text.png',import.meta.url).href, // 文字背景
				isRoate: true, // 是否旋转
				color: [1, 0, 0, 1],
			  },
			})
		  }
		  let icons = viewer.scene.primitives.add(
			// 以primitive的方式添加
			new Cesium.DTMarkIcons({
			  marks,
			  lineWidth: 1, // body长度
			  markSize: 10, // head大小
			})
		  )
		  console.log(icons)
			viewer.scene.camera.setView({
			  destination: new Cesium.Cartesian3(
				-3199540.572898054,
				4926294.4611435905,
				2476836.925695589
			  ),
			  orientation: {
				heading: 4.731597993313004,
				pitch: -0.1782570432760231,
				roll: 6.280736632364203,
			  },
			})
	}
}

export function calculateSurfaceDistanceOfCartesian3List(viewer: Cesium.Viewer, ps: Cesium.Cartesian3[]) {
	let sum = 0;
	for (let i = 1; i <= ps.length - 2; i++) {
		sum += calculateSurfaceDistance(
			viewer,
			Cesium.SceneTransforms.wgs84ToWindowCoordinates(viewer.scene, ps[i], new Cesium.Cartesian3()),
			Cesium.SceneTransforms.wgs84ToWindowCoordinates(viewer.scene, ps[i + 1], new Cesium.Cartesian3())
		);
	}
	return sum;
}
/**
 * 计算线段的表面距离
 * @param startPoint  -线段起点的屏幕坐标
 * @param endPoint    -线段终点的屏幕坐标
 * @returns 表面距离
 */
export function calculateSurfaceDistance(
	viewer: Cesium.Viewer,
	startPoint: Cesium.Cartesian2,
	endPoint: Cesium.Cartesian2
): number {
	debugger;
	let resultDistance = 0;
	const sampleWindowPoints = [startPoint];
	const length = Math.sqrt(Math.pow(endPoint.x - startPoint.x, 2) + (endPoint.y - startPoint.y, 2));
	for (let ii = 50; ii <= length; ii++) {
		const tempPositon = findWindowPositionByPixelInterval(startPoint, endPoint, ii);
		sampleWindowPoints.push(tempPositon);
	}
	sampleWindowPoints.push(endPoint);
	for (let jj = 0; jj < sampleWindowPoints.length - 1; jj++) {
		resultDistance += calculateDetailSurfaceLength(viewer, sampleWindowPoints[jj + 1], sampleWindowPoints[jj]);
	}
	return resultDistance;
}

/**
 * 计算细分后的，每一小段的笛卡尔坐标距离（也就是大地坐标系距离）
 * @param startPoint -每一段线段起点
 * @param endPoint -每一段线段终点
 * @returns 表面距离
 */
export function calculateDetailSurfaceLength(
	viewer: Cesium.Viewer,
	startPoint: Cesium.Cartesian2,
	endPoint: Cesium.Cartesian2
): number {
	let innerS = 0;
	const surfaceStartCartesian3 = pickCartesian(viewer, startPoint);
	const surfaceEndCartesian3 = pickCartesian(viewer, endPoint);
	if (
		typeof surfaceStartCartesian3.cartesian !== "undefined" &&
		typeof surfaceEndCartesian3.cartesian !== "undefined"
	) {
		const cartographicStart = Cesium.Cartographic.fromCartesian(surfaceStartCartesian3.cartesian);
		const cartographicEnd = Cesium.Cartographic.fromCartesian(surfaceEndCartesian3.cartesian);
		const geoD = new Cesium.EllipsoidGeodesic();
		geoD.setEndPoints(cartographicStart, cartographicEnd);
		innerS = geoD.surfaceDistance;
		innerS = Math.sqrt(Math.pow(innerS, 2) + Math.pow(cartographicStart.height - cartographicEnd.height, 2));
	}
	return innerS;
}

/**
 * 获取线段上距起点一定距离出的线上点坐标（屏幕坐标）
 * @param startPosition  -线段起点（屏幕坐标）
 * @param endPosition -线段终点（屏幕坐标）
 * @param interval -距起点距离
 * @returns -结果坐标（屏幕坐标）
 */
export function findWindowPositionByPixelInterval(
	startPosition: Cesium.Cartesian2,
	endPosition: Cesium.Cartesian2,
	interval: number
): Cesium.Cartesian2 {
	let result = new Cesium.Cartesian2(0, 0);
	const length = Math.sqrt(Math.pow(endPosition.x - startPosition.x, 2) + Math.pow(endPosition.y - startPosition.y, 2));
	if (length < interval) {
		return result;
	} else {
		const x = (interval / length) * (endPosition.x - startPosition.x) + startPosition.x;
		//alert(interval/length)
		const y = (interval / length) * (endPosition.y - startPosition.y) + startPosition.y;
		result.x = x;
		result.y = y;
	}
	return result;
}
export function pickCartesian(viewer: Cesium.Viewer, point: Cesium.Cartesian2) {
	return viewer.scene.pickPosition(point, new Cesium.Cartesian3());
}
