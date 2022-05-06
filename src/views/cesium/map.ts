import * as Cesium from "cesium";
export function main(elementId: string, tiandituTk: string) {
	const viewer = new Cesium.Viewer(elementId, {
		shadows: true,
	});

	// console.log(viewer)
	// viewer.scene.globe.depthTestAgainstTerrain = true;
	// const tileset = new Cesium.Cesium3DTileset({
	// 	url: "/SampleData/Cesium3DTiles/Tilesets/Tileset/tileset.json",
	// });
	// tileset.readyPromise.then(function (tileset) {
	// 	viewer.scene.primitives.add(tileset);
	// 	viewer.zoomTo(tileset, new Cesium.HeadingPitchRange(0.0, -0.5, tileset.boundingSphere.radius * 2.0));
	// });
}
