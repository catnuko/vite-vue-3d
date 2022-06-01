
import { cartesian32LonLat } from "ht-cesium-utils";
export namespace Topology {
	export function center(points: Cesium.Cartesian3[]) {
		const centerGeo = Cesium.BoundingSphere.fromPoints(points).center;
		return Cesium.Ellipsoid.WGS84.scaleToGeodeticSurface(centerGeo);
	}
	export function centerMultiPolygon(pointsList: Array<Cesium.Cartesian3[]>) {
		let centerList: Cesium.Cartesian3[] = [];
		for (let i = 0; i < pointsList.length; i++) {
			centerList.push(center(pointsList[i]));
		}
		return center(centerList);
	}
	export function centerFeature(f) {
		if (f.geometry.type == "MultiPolygon") {
			return centerMultiPolygon(
				f.geometry.coordinates[0].map((x) => x.map((y) => Cesium.Cartesian3.fromDegrees(y[0], y[1], 0)))
			);
		} else {
			return center(f.geometry.coordinates[0].map((x) => Cesium.Cartesian3.fromDegrees(x[0], x[1], 0)));
		}
	}
}

const coordinates = [
	[
		[120.92702174103488, 27.993170646047872],
		[120.92699878569101, 27.99316787279139],
		[120.92700416565572, 27.993136837124382],
		[120.92699506094016, 27.993135232184216],
		[120.92699872413311, 27.993116508278604],
		[120.92700332202446, 27.99311712387663],
		[120.92700882442034, 27.993090678955184],
		[120.92700783858186, 27.993090441226627],
		[120.92700834025152, 27.993088581663244],
		[120.92701007990365, 27.993080843281405],
		[120.92701100945487, 27.99308015159255],
		[120.92702728521283, 27.992993793473886],
		[120.92702781461708, 27.99297775577611],
		[120.92705321957737, 27.992977944884217],
		[120.92704893765142, 27.993038829797854],
		[120.92707600818039, 27.993042292063194],
		[120.9270736902896, 27.993075361792364],
		[120.92707359835856, 27.993075344657655],
		[120.92707366256525, 27.99307547952168],
		[120.92706428517488, 27.993115299725844],
		[120.9270285932597, 27.99311292026499],
		[120.92702174103488, 27.993170646047872],
	],
];
const coordinates1 =[[[120.9276955196233,27.99282305678115],[120.92771355249756,27.992634610130935],[120.9277769249326,27.992639516108586],[120.92776870551508,27.99281751204188],[120.9276955196233,27.99282305678115]]]
export function main() {
	const feature = {
		geometry: {
			type: "Polygon",
			coordinates: coordinates1,
		},
		type: "Feature",
		properties: {},
	};
	const center = Topology.centerFeature(feature);
	const lonlat = cartesian32LonLat(center);
	console.log("lonlat");
	console.log(lonlat);
}
