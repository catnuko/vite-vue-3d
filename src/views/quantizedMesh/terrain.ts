import { SurfaceProvider, geographicTilingScheme } from "./map/surface-provider";
import { DataSource, DataSourceOptions } from "@here/harp-mapview";
import { TileKey, TilingScheme, webMercatorTilingScheme } from "@here/harp-geoutils";
import { Tile } from "@here/harp-mapview/lib/Tile";
import { defaultToken, getCesiumIonUrl, geoBoxToRectange, sampleHeight, createGrid } from "../../utils/cesium";
import { getImageRequestParams } from "../../utils/url";

export interface QuantizedMeshTerrainDataSourceParameters extends DataSourceOptions {}
export class QuantizedMeshTerrainDataSource extends DataSource {
	terrainProvider: SurfaceProvider;
	headers: object;
	constructor(private readonly m_options: QuantizedMeshTerrainDataSourceParameters) {
		super(m_options);
		this.terrainProvider = new SurfaceProvider({
			getUrl: (x, y, level) => {
				const params = {
					extensions: "metadata",
					v: "1.2.0",
				};
				const parameters = getImageRequestParams(params);
				return `https://assets.cesium.com/1/${level}/${x}/${y}.terrain?${parameters}`;
			},
		});
	}
	getHeader() {
		return getCesiumIonUrl(1, defaultToken).then((res) => {
			return {
				authorization: res.bearerToken,
			};
		});
	}
	getTile(tileKey: TileKey, delayLoad?: boolean): Tile | undefined {
		const tile = new Tile(this, tileKey);
		this.getRequestHeader().then((headers) => {
			this.terrainProvider
				.requestTileGeometry(tileKey.row, tileKey.column, tileKey.level, headers)
				.then((quantizedMeshData) => {
					if (quantizedMeshData) {
						sampleHeight(quantizedMeshData, tile);
						this.requestUpdate();
					}
				});
		});
		return tile;
	}
	getRequestHeader() {
		if (this.headers) {
			return Promise.resolve(this.headers);
		} else {
			return getCesiumIonUrl(1, defaultToken).then((res) => {
				this.headers = {
					Authorization: res.bearerToken,
				};
				return this.headers;
			});
		}
	}
	getTilingScheme(): TilingScheme {
		return webMercatorTilingScheme;
	}
}
