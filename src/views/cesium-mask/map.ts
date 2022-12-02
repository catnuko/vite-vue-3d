import * as Cesium from "cesium";
import { cartesian32LonLat, giveCartesian3Height } from "ht-cesium-utils";
import { geojson } from "./浦江县.js";
export class MapShow {
	constructor(private readonly viewer: Cesium.Viewer) {
		console.log(this.viewer);
		let geojsonDataSourcePromise = this.viewer.dataSources.add(Cesium.GeoJsonDataSource.load(geojson));
		this.viewer.flyTo(geojsonDataSourcePromise, { duration: 1 });
		geojsonDataSourcePromise.then((geojsonDataSource) => {
			console.log("this.viewer, geojsonDataSource");
			let positions = geojsonDataSource._entityCollection.values[0].polygon.hierarchy._value.positions;
			console.log(geojsonDataSource);
			console.log(positions);
			// this.viewer.scene.preRender.addEventListener((a) => {
			// 	let ctx = a.canvas.getContext("webgl");
			// 	console.log(ctx);
			// 	positions.map((position) => {
			// 		const scratch = new Cesium.Cartesian2();
			// 		const canvasPosition = viewer.scene.cartesianToCanvasCoordinates(position, scratch);
			// 		return canvasPosition;
			// 	});
			// });
			let stageTest = new Cesium.PostProcessStage({
				name: "mask",
				fragmentShader: `
					uniform sampler2D colorTexture;
					varying vec2 v_textureCoordinates;
					void main(void)
					{
						vec4 color = texture2D(colorTexture, v_textureCoordinates);
						gl_FragColor = vec4(color.rgb,1.0);
					}
				`,
			});
			viewer.scene.postProcessStages.add(stageTest);
		});
	}
}
