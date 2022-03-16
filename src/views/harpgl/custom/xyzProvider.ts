import { WebTileDataProvider } from "@here/harp-webtile-datasource";
import { Texture } from "three";
import { CopyrightInfo, RequestHeaders, TextureLoader, Tile, UrlCopyrightProvider } from "@here/harp-mapview";
const textureLoader = new TextureLoader();
export interface WMTSProviderParameters {
	baseUrl?: string;
	parameter?: {
		format?: "image/png" |"png"| "tiles";
		layer?: string;
		maximumLevel?: string;
		minimumLevel?: string;
		service: "wmts" | "wms";
		tk?: string;
	};
}
//http://t{s}.tianditu.com/cia_w/wmts?service=wmts&request=GetTile&version=1.0.0&LAYER=cia&tileMatrixSet=w&TileMatrix={TileMatrix}&TileRow={TileRow}&TileCol={TileCol}&style=default.jpg&tk=${tiandituTk}
export class WMTSProvider implements WebTileDataProvider {
	private readonly m_baseUrl: string;
	constructor(private readonly m_options: WMTSProviderParameters) {
		this.m_baseUrl = m_options.baseUrl;
	}
	async getTexture(tile: Tile, abortSignal?: AbortSignal): Promise<[Texture, undefined]> {
		const column = tile.tileKey.column;
		const row = tile.tileKey.row;
		const level = tile.tileKey.level;
		const quadKey = tile.tileKey.toQuadKey();
		const params = this.getImageRequestParams();
		const url = `${this.m_baseUrl}/tile/${level}/${row}/${column}`;
		return Promise.all([textureLoader.load(url, {}, abortSignal), undefined]);
	}
	private getImageRequestParams(): string {
		let params = ["request=GetTile", "version=1.0.0", "tileMatrixSet=w", "style=default"];
		for (let key in this.m_options.parameter) {
			params.push(`${key}=${this.m_options.parameter[key]}`);
		}
		return params.join("&");
	}
}
