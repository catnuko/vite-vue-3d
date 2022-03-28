import { MapView, MapViewEventNames } from "@here/harp-mapview";
import { MapControls, MapControlsUI } from "@here/harp-map-controls";
import { WebTileDataSource } from "@here/harp-webtile-datasource";
import { WMTSProvider } from "../views/harpgl/custom/xyzProvider";
import Cesium from "dtcesium";
import { GeoCoordinatesLike } from "@here/harp-geoutils";
export function createMapView(id: string, dataSource = true) {
	const canvas = document.getElementById(id) as HTMLCanvasElement;
	const map = new MapView({
		canvas,
		theme: "https://unpkg.com/@here/harp-map-theme@latest/resources/berlin_tilezen_night_reduced.json",
	});
	const mapControls = new MapControls(map);
	// mapControls.maxTiltAngle = 50;
	const ui = new MapControlsUI(mapControls, { zoomLevel: "input", projectionSwitch: true });
	canvas.parentElement!.appendChild(ui.domElement);
	ui.projectionSwitchElement.click();
	if (dataSource) {
		const wmsDataSource = new WebTileDataSource({
			dataProvider: new WMTSProvider({
				baseUrl: "http://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer",
				parameter: {
					format: "png",
					layer: "img",
					maximumLevel: "22",
					service: "wmts",
				},
			}),
		});
		map.addDataSource(wmsDataSource);
	}

	return map;
}
export function cartographicInDegree(p: Cesium.Cartographic): GeoCoordinatesLike {
	return {
		longitude: Cesium.Math.toDegrees(p.longitude),
		latitude: Cesium.Math.toDegrees(p.latitude),
		altitude: p.height,
	};
}
