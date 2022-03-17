import * as THREE from "three";
import { webMercatorTilingScheme, TileKey, GeoBox, TileKeyUtils } from "@here/harp-geoutils";
export interface QuantizedMeshDataParameters {
	decodedMesh: any;
}
export class QuantizedMeshData {
	constructor(private readonly m_options: QuantizedMeshDataParameters) {}
	generateDummyTileHeader(x, y, level) {
		const tileRect = this.tilingScheme.tileXYToRectangle(x, y, level);
		const tileNativeRect = this.tilingScheme.tileXYToNativeRectangle(x, y, level);
		const tileCenter = Cesium.Cartographic.toCartesian(Cesium.Rectangle.center(tileRect));
		const horizonOcclusionPoint = Cesium.Ellipsoid.WGS84.transformPositionToScaledSpace(tileCenter);

		return {
			centerX: tileCenter.x,
			centerY: tileCenter.y,
			centerZ: tileCenter.z,
			minHeight: 0,
			maxHeight: 0,
			boundingSphereCenterX: tileCenter.x,
			boundingSphereCenterY: tileCenter.y,
			boundingSphereCenterZ: tileCenter.z,
			boundingSphereRadius: tileNativeRect.height,
			horizonOcclusionPointX: horizonOcclusionPoint.x,
			horizonOcclusionPointY: horizonOcclusionPoint.y,
			horizonOcclusionPointZ: horizonOcclusionPoint.z,
		};
	}
	generateDummyTile(x, y, level) {
		return Object.assign({}, this.m_options.decodedMesh, this.generateDummyTileHeader(x, y, level));
	}
	createQuantizedMeshData(decodedTile, x, y, level) {
		const tileRect = this.tilingScheme.tileXYToRectangle(x, y, level);
		const boundingSphereCenter = new Cesium.Cartesian3(
			decodedTile.header.boundingSphereCenterX,
			decodedTile.header.boundingSphereCenterY,
			decodedTile.header.boundingSphereCenterZ
		);
		const boundingSphere = new Cesium.BoundingSphere(boundingSphereCenter, decodedTile.header.boundingSphereRadius);
		const horizonOcclusionPoint = new Cesium.Cartesian3(
			decodedTile.header.horizonOcclusionPointX,
			decodedTile.header.horizonOcclusionPointY,
			decodedTile.header.horizonOcclusionPointZ
		);

		let orientedBoundingBox;

		if (tileRect.width < Cesium.Math.PI_OVER_TWO + Cesium.Math.EPSILON5) {
			orientedBoundingBox = Cesium.OrientedBoundingBox.fromRectangle(
				tileRect,
				decodedTile.header.minHeight,
				decodedTile.header.maxHeight
			);
		}

		return new Cesium.QuantizedMeshTerrainData({
			minimumHeight: decodedTile.header.minHeight,
			maximumHeight: decodedTile.header.maxHeight,
			quantizedVertices: decodedTile.vertexData,
			indices: decodedTile.triangleIndices,
			boundingSphere: boundingSphere,
			orientedBoundingBox: orientedBoundingBox,
			horizonOcclusionPoint: horizonOcclusionPoint,
			westIndices: decodedTile.westIndices,
			southIndices: decodedTile.southIndices,
			eastIndices: decodedTile.eastIndices,
			northIndices: decodedTile.northIndices,
			westSkirtHeight: 100,
			southSkirtHeight: 100,
			eastSkirtHeight: 100,
			northSkirtHeight: 100,
			childTileMask: 15,
			credits: this.credits,
		});
	}
	getLevelMaximumGeometricError(level) {
		const levelZeroMaximumGeometricError = Cesium.TerrainProvider.getEstimatedLevelZeroGeometricErrorForAHeightmap(
			this.tilingScheme.ellipsoid,
			65,
			this.tilingScheme.getNumberOfXTilesAtLevel(0)
		);

		return levelZeroMaximumGeometricError / (1 << level);
	}
}
export function createTileHeader(tileKey: TileKey) {
	const tileRect = webMercatorTilingScheme.getGeoBox(tileKey);
	const tileNativeRect = projectionGeoBox(tileRect);

	return {};
}
export function createQuantizedMeshDataParameters(decodedMesh, tileKey: TileKey) {
	decodedMesh.header = {
		...decodedMesh.header,
		...createTileHeader(tileKey),
	};
	const boundingSphereCenter = new THREE.Vector3();
}

export function projectionGeoBox(geobox: GeoBox) {
	const southwest = webMercatorTilingScheme.projection.projectPoint({ longitude: geobox.west, latitude: geobox.south });
	const northeast = webMercatorTilingScheme.projection.projectPoint({ longitude: geobox.east, latitude: geobox.north });
	return { west: southwest.x, south: southwest.y, east: northeast.x, north: northeast.y };
}
