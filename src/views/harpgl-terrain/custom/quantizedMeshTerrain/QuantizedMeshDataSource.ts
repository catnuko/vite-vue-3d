import * as THREE from "three";
import { SphericalGeometrySubdivisionModifier } from "@here/harp-geometry/lib/SphericalGeometrySubdivisionModifier";
import { ProjectionType, TileKey, TilingScheme, webMercatorTilingScheme } from "@here/harp-geoutils";
import { DataSource, Tile } from "@here/harp-mapview";
import { Projection, EarthConstants } from "@here/harp-geoutils";
import { CesiumWorldTerrain, getCesiumWorldTerrain } from "../CesuimIonLoader";
import decode, { DECODING_STEPS } from "@here/quantized-mesh-decoder";
import { constructGeometry, getMeshMaterial, getObject } from "./createQuantizedMesh";
// export class EarthConstants {
//     /** The equatorial circumference in meters. */
//     static EQUATORIAL_CIRCUMFERENCE: number = 40075016.6855784861531768177614;

//     /** The equatorial radius in meters. */
//     static EQUATORIAL_RADIUS: number = 6378137.0;

//     /** The lowest point on earth (Dead Sea) in meters. */
//     static MIN_ELEVATION: number = -433.0;

//     /** The highest point on earth (Mt. Everest) in meters. */
//     static MAX_ELEVATION: number = 8848.0;

//     /** The highest artificial structure (building) on earth, Burj Khalifa tower in Dubai */
//     static MAX_BUILDING_HEIGHT: number = 828;
// }

const textureLoader = new THREE.TextureLoader();
textureLoader.crossOrigin = ""; // empty assignment required to support CORS

export class QuantizedMeshDataSource extends DataSource {
	m_cesiumWorldTerrain?: CesiumWorldTerrain;
	constructor() {
		super({
			name: "terraintile",
			minZoomLevel: 1,
			maxZoomLevel: 20,
		});
		this.cacheable = true;
		this.storageLevelOffset = -1;
	}

	/** @override */
	shouldPreloadTiles(): boolean {
		return true;
	}

	/** @override */
	getTilingScheme(): TilingScheme {
		return webMercatorTilingScheme;
	}

	/** @override */
	getTile(tileKey: TileKey): Tile {
		const decodingSteps = Object.keys(DECODING_STEPS);
		const defaultParams = {
			meshUrl: "/example-tiles/13/1312/5176.terrain",
			appearance: "normal",
			normalHelper: false,
			light: false,
			lightHelper: false,
			wireframe: true,
			edgeVertices: false,
			maxDecodingStep: decodingSteps[decodingSteps.length - 1],
		};
		const tile = new Tile(this, tileKey);
		const url = `https://assets.cesium.com/1/${tileKey.row}/${tileKey.column}/${tileKey.level}.terrain`;
		Promise.resolve(this.loadTerrain(url))
			.then((buffer) => {
				const decodedMesh = decode(buffer, {
					maxDecodingStep: DECODING_STEPS[defaultParams.maxDecodingStep],
				});
				if (decodedMesh.vertexData === undefined) {
					throw "顶点数据不存在";
				}
				const length = EarthConstants.EQUATORIAL_RADIUS*2;
				const container = new THREE.Box3(
					new THREE.Vector3(-1 * length, -1 * length, 0),
					new THREE.Vector3(-1 * length, -1 * length, -1 * length)
				);
				let tilingScheme = this.getTilingScheme()
				const geobox = tilingScheme.getGeoBox(tileKey)
				// tile.boundingBox.copy
				const geometry = constructGeometry(decodedMesh, geobox);
				const material = getMeshMaterial(defaultParams);
				const terrain = getObject(geometry, material, defaultParams);
				const shouldSubdivide = this.projection.type === ProjectionType.Spherical;
				const sourceProjection = this.getTilingScheme().projection;
		
				// This is taken from the code for the background plane in OmvDataSource
				// but doesn't work here for the sphere projection somehow. Requires fix.
				if (shouldSubdivide) {
					const modifier = new SphericalGeometrySubdivisionModifier((10 / 180) * Math.PI, sourceProjection);
					modifier.modify(terrain.geometry as THREE.BufferGeometry);
				}
				tile.objects.push(terrain);
				tile.invalidateResourceInfo();
				this.requestUpdate();
			})
			.catch((error) => {
				console.error(error);
			});
		return tile;
	}
	private async loadTerrain(url: string) {
		if (!this.m_cesiumWorldTerrain) {
			this.m_cesiumWorldTerrain = await getCesiumWorldTerrain();
		}
		const res = await fetch(url, {
			headers: {
				Authorization: this.m_cesiumWorldTerrain.bearerToken,
				// "Access-Control-Allow-Credentials": "true",
				// "Access-Control-Allow-Origin": "*",
			},
		});
		return res.arrayBuffer();
	}
}
