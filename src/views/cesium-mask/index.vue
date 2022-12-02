<template>
	<HtGlobe :tiandituTk="tiandituTk" @loaded="onLoaded"> </HtGlobe>
</template>
<script lang="ts">
import { defineComponent, onMounted } from "vue";
import { HtGlobe } from "ht-components";
import { MapShow } from "./map";
export default defineComponent({
	name: "harpgl",
	components: { HtGlobe },
	setup(props, { slots, emit }) {
		const tiandituTk = "7a801d6cd03da3cc229d90a6c8897e2a";
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
