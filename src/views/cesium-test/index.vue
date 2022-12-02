<template>
	<HtGlobe :tiandituTk="tiandituTk" @loaded="onLoaded"> </HtGlobe>
</template>
<script setup>
import { defineComponent, onMounted, ref } from "vue";
import { HtGlobe } from "ht-components";
import { pathLibrary } from "./path-xiaoYuan";
import * as turf from "@turf/turf";
const arrowImg = new URL("./arrow-up.png", import.meta.url).href;
const tiandituTk = window.projectConfig.tiandituTk;
const onLoaded = (viewer) => {
	if (Cesium.FeatureDetection.supportsImageRenderingPixelated()) {
		viewer.resolutionScale = window.devicePixelRatio;
	}
	let positions = pathLibrary.德清县特警大队.polyline;
	// 开启抗锯齿
	viewer.scene.postProcessStages.fxaa.enabled = true;
	let polyline = viewer.entities.add({
		polyline: {
			positions: positions,
			width: 1,
			material: new Cesium.PolylineDashMaterialProperty({
				color: Cesium.Color.fromCssColorString("#4662d9").withAlpha(0.0),
				gapColor: Cesium.Color.WHITE.withAlpha(0.0),
				dashLength: 0,
			}),
			clampToGround: true,
		},
		show: true,
	});
	viewer.flyTo(polyline, { duration: 0.5 });
	let bkColor = Cesium.Color.fromCssColorString("#4662d9");
	let arrowColor = Cesium.Color.WHITE.withAlpha(0.1);
	console.log(Cesium);
	let p = viewer.scene.primitives.add(
		new Cesium.GroundPolylinePrimitive({
			geometryInstances: new Cesium.GeometryInstance({
				geometry: new Cesium.GroundPolylineGeometry({
					positions: positions,
					width: 10.0,
					vertexFormat: Cesium.PolylineMaterialAppearance.VERTEX_FORMAT,
				}),
			}),
			appearance: new Cesium.PolylineMaterialAppearance({
				material: new Cesium.Material({
					fabric: {
						// type: Cesium.Material.PolylineDashType,
						uniforms: {
							color: new Cesium.Color(1.0, 0.0, 0.0, 1.0),
							image: arrowImg,
							markerdelta: 0.02,
							uvdelta: 0.01,
						},
						source: `
							uniform vec4 color;
							uniform float uvdelta;
							uniform float markerdelta;
							uniform sampler2D image;
							czm_material czm_getMaterial(czm_materialInput materialInput)
							{
								czm_material material = czm_getDefaultMaterial(materialInput);
								vec2 uv = materialInput.st;							
								vec4 fragColor = color;
								vec4 tc = vec4(1.0, 1.0, 1.0, 0.0);
								vec2 vUV = materialInput.st;
								float uvx = vUV.x;
								float muvx = mod(uvx, markerdelta);
								float halfd = markerdelta / 2.0;
								if(muvx >= halfd && muvx <= halfd + uvdelta) {
									float s = (muvx - halfd) / uvdelta;
									tc = texture2D(image, vec2(s,vUV.y));
									fragColor.xyzw = tc.w >= 0.5 ? tc.xyzw : fragColor.xyzw;
								}
								fragColor = czm_gammaCorrect(fragColor);
								fragColor.r = markerdelta;
								material.emission = fragColor.rgb;
								material.alpha = fragColor.a;
								return material;
							}
						`,
					},
					translucent: true,
				}),
			}),
		})
	);
	let ps = positions.map((p) => {
		let c = Cesium.Cartographic.fromCartesian(p);
		return [Cesium.Math.toDegrees(c.longitude), Cesium.Math.toDegrees(c.latitude)];
	});
	var line = turf.lineString(ps);
	var length = turf.length(line, { units: "meters" });
	const cb = () => {
		if (!p.appearance) return;
		let pixelSize = viewer.camera.frustum.getPixelDimensions(
			viewer.scene.drawingBufferWidth,
			viewer.scene.drawingBufferHeight,
			viewer.camera.positionCartographic.height,
			viewer.scene.pixelRatio,
			new Cesium.Cartesian2()
		);
		pixelSize = pixelSize.x;
		const MARKER_DELTA = 100;
		let markerdelta = (MARKER_DELTA * pixelSize) / length;
		p.appearance.material.uniforms.markerdelta = markerdelta;
		p.appearance.material.uniforms.uvdelta = markerdelta / 4;
	};
	viewer.camera.changed.addEventListener(cb);
	console.log(p);
};
</script>
<style scoped>
#cesium-map {
	width: 100%;
	height: 100%;
}
.tool {
	z-index: 1;
	width: 20vw;
	position: absolute;
	right: 2vw;
	top: 10vh;
	background-color: white;
	padding: 20px;
}
</style>
