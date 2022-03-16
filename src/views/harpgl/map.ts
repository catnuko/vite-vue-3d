import { MapView, MapViewEventNames } from "@here/harp-mapview";
import { MapControls, MapControlsUI } from "@here/harp-map-controls";
import { WebTileDataSource } from "@here/harp-webtile-datasource";
import { WMTSProvider } from "./custom/xyzProvider";
import * as THREE from "three";
import { TerrainRGBDataSource } from "./custom/TerrainRGBDataSource";
import { VectorTileDataSource } from "@here/harp-vectortile-datasource";
import { OmvDataSource, APIFormat } from "@here/harp-omv-datasource";
import { TilesRenderer } from "3d-tiles-renderer";
import { GeoCoordinates } from "@here/harp-geoutils";

export const apikey = "J0IJdYzKDYS3nHVDDEWETIqK3nAcxqW42vz7xeSq61M";
function makeCube() {
	const scale = 1000;
	const geometry = new THREE.BoxGeometry(1 * scale, 1 * scale, 1 * scale);
	const prePassMaterial = new THREE.MeshStandardMaterial({
		color: "#ff00fe",
		opacity: 0.3,
		depthTest: false,
		transparent: true,
	});
	const material = new THREE.MeshStandardMaterial({
		color: "#ff00fe",
		opacity: 0.9,
		transparent: true,
	});
	const cube = new THREE.Object3D();

	const prePassMesh = new THREE.Mesh(geometry, prePassMaterial);
	prePassMesh.renderOrder = Number.MAX_SAFE_INTEGER - 1;
	cube.add(prePassMesh);

	const mesh = new THREE.Mesh(geometry, material);
	mesh.renderOrder = Number.MAX_SAFE_INTEGER;
	cube.add(mesh);
	return cube;
}
export function makeMap(id: string) {
	const canvas = document.getElementById(id) as HTMLCanvasElement;
	const map = new MapView({
		canvas,
		theme: "https://unpkg.com/@here/harp-map-theme@latest/resources/berlin_tilezen_night_reduced.json",
	});
	const mapControls = new MapControls(map);
	mapControls.maxTiltAngle = 50;
	// end:harp_gl_hello_world_example_map_controls.ts

	// Add an UI.
	const ui = new MapControlsUI(mapControls, { zoomLevel: "input", projectionSwitch: true });
	canvas.parentElement!.appendChild(ui.domElement);
	ui.projectionSwitchElement.click();
	// center the camera to New York

	const tiandituTk = "1292dbbb36f799c61eabc3c732eef02c";

	// const omvDataSource = new VectorTileDataSource({
	// 	baseUrl: "https://vector.hereapi.com/v2/vectortiles/base/mc",
	// 	authenticationCode: apikey,
	// });
	// map.addDataSource(omvDataSource);

	// const omvDataSource = new OmvDataSource({
	// 	// concurrentDecoderScriptUrl: "dist/harp-worker.bundle.js",
	// 	baseUrl: "https://xyz.api.here.com/tiles/osmbase/512/all",
	// 	apiFormat: APIFormat.XYZMVT,
	// 	styleSetName: "tilezen",
	// 	maxZoomLevel: 17,
	// 	authenticationCode: "AGln99HORnqL1kfIQtsQl70",
	// });
	// map.addDataSource(omvDataSource).then(() => {
	// 	omvDataSource.setLanguages(["en"]);
	// });

	const wmsDataSource = new WebTileDataSource({
		// dataProvider: new WMTSProvider({
		// 	baseUrl: "http://t1.tianditu.com/img_w/wmts",
		// 	parameter: {
		// 		format: "tiles",
		// 		tk: tiandituTk,
		// 		layer: "img",
		// 		maximumLevel: 17,
		// 		service: "wmts",
		// 	},
		// }),
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

	// const mapboxAccessKey =
	// 	"pk.eyJ1IjoiZHVtYmxlZG9yZTk5IiwiYSI6ImNqc29meGFjeTBrYTk0M255eHZueWtydHMifQ.CJEbodjhMFYCdm8nmCsMhg";
	// const terrain = new TerrainRGBDataSource(mapboxAccessKey);
	// map.addDataSource(terrain);

	const tilesRenderer = new TilesRenderer("/SampleData/Cesium3DTiles/Tilesets/Tileset/tileset.json");
	tilesRenderer.setCamera(map.camera);
	tilesRenderer.setResolutionFromRenderer(map.camera, map.renderer);
	map.scene.add(tilesRenderer.group);
	const geoPosition = new GeoCoordinates(40.044283736107154, -75.61003529955931);
	map.lookAt({
		target: geoPosition,
		zoomLevel: 15,
		tilt: 40,
	});
	const cube = makeCube();
	(cube as any).anchor = geoPosition;
	map.mapAnchors.add(cube);
	map.addEventListener(MapViewEventNames.Render, () => {
		map.camera.updateMatrixWorld()
		tilesRenderer.update()
	});
	return map;
}
// Loader3DTiles.load({
// 	// url: "https://int.nyt.com/data/3dscenes/ONA360/TILESET/0731_FREEMAN_ALLEY_10M_A_36x8K__10K-PN_50P_DB/tileset_tileset.json",
// 	url: "/SampleData/Cesium3DTiles/Tilesets/Tileset/tileset.json",
// 	renderer: map.renderer,
// 	options: {
// 		dracoDecoderPath: "https://unpkg.com/three@0.133.0/examples/js/libs/draco",
// 		basisTranscoderPath: "https://unpkg.com/three@0.133.0/examples/js/libs/basis",
// 		worker: true,
// 	},
// }).then((res: { model: Group; runtime: any }) => {
// 	// const geoPosition = new GeoCoordinates(29.089524, 119.649506);
// 	// const geoPosition = new GeoCoordinates(16.786773020919487, 47.875432617954814);
// 	const geoPosition = new GeoCoordinates(40.044283736107154, -75.61003529955931);
// 	console.log(res, geoPosition);
// 	console.log(map.projection);
// 	map.lookAt({
// 		target: geoPosition,
// 		zoomLevel: 15,
// 		tilt: 40,
// 	});
// 	const cube = makeCube();
// 	(cube as any).anchor = geoPosition;
// 	map.mapAnchors.add(cube);
// 	// res.model.applyMatrix4(new Matrix4().makeTranslation(20000, 20000, 20000));
// 	// const transofmrMatrix = Cesium.Transforms.eastNorthUpToFixedFrame(
// 	// 	Cesium.Cartesian3.fromDegrees(geoPosition.longitude, geoPosition.latitude, geoPosition.altitude),
// 	// 	undefined,
// 	// 	new Cesium.Matrix4()
// 	// );
// 	const m4 = new Matrix4().set(
// 		0.968626704061415,
// 		-0.1598928235811774,
// 		0.19025402268114708,
// 		1215151.0131838717,
// 		0.2485202369609363,
// 		0.6231945559139855,
// 		-0.7415296604317663,
// 		-4736144.36888773,
// 		0,
// 		0.7655474057472921,
// 		0.6433794910887284,
// 		4081751.0271019046,
// 		0,
// 		0,
// 		0,
// 		1
// 	);
// 	res.model.applyMatrix4(m4);
// 	map.scene.add(res.model);

// 	const tileset = res.runtime.getTileset();
// 	console.log("tileset");
// 	console.log(tileset);

// 	map.addEventListener(MapViewEventNames.Render, () => {
// 		const dt = clock.getDelta();
// 		console.log(tileset.root._distanceToCamera);
// 		if (res.runtime) {
// 			res.runtime.update(dt, map.renderer, map.camera);
// 		}
// 	});
// });
