<template>
	<HtGlobe :tiandituTk="tiandituTk" @loaded="onLoaded"> </HtGlobe>
</template>
<script lang="ts">
import { defineComponent, onMounted } from "vue";
import { main } from "./map";
import { HtGlobe } from "ht-components";
import { MapShow } from "./map";
export default defineComponent({
	name: "harpgl",
	components: { HtGlobe },
	setup(props, { slots, emit }) {
		const tiandituTk = "1292dbbb36f799c61eabc3c732eef02c";
		const onLoaded = (viewer) => {
			new MapShow(viewer);
		};
		return { tiandituTk, onLoaded };
	},
});
</script>
<style scoped>
#cesium-map {
	width: 100%;
	height: 100%;
}
</style>
