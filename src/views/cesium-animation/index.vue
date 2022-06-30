<script setup lang="ts">
import { defineComponent, onMounted } from "vue";
import { MapShow } from "./map";
import { HtGlobe } from "ht-components";
import "./main.scss";
const tiandituTk = "1292dbbb36f799c61eabc3c732eef02c";
const onLoaded = (viewer) => {
	new MapShow(viewer);
};
const createViewerOption = {
	timeline: true,
	animation: true,
	shouldAnimate: true,
};
</script>
<template>
	<HtGlobe
		:tiandituTk="tiandituTk"
		@loaded="onLoaded"
		:createViewerOption="createViewerOption"
	>
	</HtGlobe>
</template>
<style scoped>
#cesium-map {
	width: 100%;
	height: 100%;
}
</style>
