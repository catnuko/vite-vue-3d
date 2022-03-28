import * as THREE from "three";
import { createMapView } from "../../utils/harp";
import { QuantizedMeshTerrainDataSource } from "./terrain";

export function main(id: string) {
	const mapView = createMapView(id);
	const terrainDataSource = new QuantizedMeshTerrainDataSource({ name: "quantizedMeshTerrainDataSource" });
	// mapView.addDataSource(terrainDataSource)
	mapView.lookAt({
		target: {
			longitude: 86.8891525,
			latitude: 27.99136985,
		},
		zoomLevel: 15,
		tilt: 80,
	});
}
