import { GeoBox } from "@here/harp-geoutils";
import Cesium from "dtcesium";
import { Tile } from "@here/harp-mapview/lib/Tile";
import { cartographicInDegree } from "./harp";
import * as THREE from "three";
export const defaultToken =
	"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI1MmIxYWJmNy0yZDA1LTRiYmQtYmI3Ny1iMGIwNTk5NWQyMWYiLCJpZCI6Mjk5MjQsImlhdCI6MTU5OTIwMDkxOX0.aUw9ehdKoobH0GEq5lp3s3Uk9_QSMZVvFFrsLsAACqc";

export function getCesiumIonUrl(assetId: number, accessToken: string) {
	const url = new URL(`https://api.cesium.com/v1/assets/${assetId}/endpoint`);
	url.searchParams.append("access_token", accessToken);
	return fetch(url.href, { mode: "cors" })
		.then((res) => res.json())
		.then((json) => {
			return { url: json.url, bearerToken: `Bearer ${json.accessToken}`, v: "", extensions: "" };
		});
}
export function geoBoxToRectange(geobox: GeoBox): Cesium.Rectangle {
	return new Cesium.Rectangle(
		Cesium.Math.toRadians(geobox.west),
		Cesium.Math.toRadians(geobox.south),
		Cesium.Math.toRadians(geobox.east),
		Cesium.Math.toRadians(geobox.north)
	);
}
export function createGrid(e: Cesium.Rectangle) {
	var gridWidth = 41;
	var gridHeight = 41;
	var terrainSamplePositions = [];
	for (var y = 0; y < gridHeight; ++y) {
		for (var x = 0; x < gridWidth; ++x) {
			var longitude = Cesium.Math.lerp(e.west, e.east, x / (gridWidth - 1));
			var latitude = Cesium.Math.lerp(e.south, e.north, y / (gridHeight - 1));
			var position = new Cesium.Cartographic(longitude, latitude);
			terrainSamplePositions.push(position);
		}
	}
	return terrainSamplePositions;
}

function interpolateAndAssignHeight(
	position: Cesium.Cartographic,
	terrainData: Cesium.TerrainData,
	rectangle: Cesium.Rectangle
) {
	var height = terrainData.interpolateHeight(rectangle, position.longitude, position.latitude);
	if (height === undefined) {
		// if height comes back as undefined, it may implicitly mean the terrain data
		//  requires us to call TerrainData.createMesh() first (ArcGIS requires this in particular)
		//  so we'll return false and do that next!
		return false;
	}
	position.height = height;
	return true;
}
export function sampleHeight(quantizedMeshData: Cesium.QuantizedMeshTerrainData, tile: Tile) {
	const rectangle = geoBoxToRectange(tile.geoBox);
	const positions = createGrid(rectangle);
	const tmpV = new THREE.Vector3();
	tile.boundingBox.getSize(tmpV);
	const maxRes = 41;
	const geometry = new THREE.PlaneBufferGeometry(tmpV.x, tmpV.y, maxRes, maxRes - 2);
	positions.forEach((position, index) => {
		const res = interpolateAndAssignHeight(position, quantizedMeshData, rectangle);
		if (res) {
			const np = cartographicInDegree(position);
			const np2 = tile.projection.projectPoint(np);
			geometry.attributes.position.setXYZ(index, np2.x, np2.y, np2.z);
		}
	});
	geometry.computeVertexNormals();
	const material = new THREE.MeshLambertMaterial({
		color: 0xc0b3aa,
	});
	const terrain = new THREE.Mesh(geometry, material);
	terrain.position.copy(tile.center);
	tile.objects.push(terrain);
	tile.invalidateResourceInfo();
}
