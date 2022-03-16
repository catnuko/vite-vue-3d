import { MapView } from "@here/harp-mapview";
import { MapControls, MapControlsUI } from "@here/harp-map-controls";
import { WebTileDataSource } from "@here/harp-webtile-datasource";
import * as THREE from "three";
import { WMTSProvider } from "../harpgl/custom/xyzProvider";
import {QuantizedMeshDataSource} from './custom/quantizedMeshTerrain/QuantizedMeshDataSource'

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

	const terrainDataSource = new QuantizedMeshDataSource()
	map.addDataSource(terrainDataSource)
	return map;
}
