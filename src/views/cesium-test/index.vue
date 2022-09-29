<template>
	<HtGlobe :tiandituTk="tiandituTk" @loaded="onLoaded"> </HtGlobe>
</template>
<script lang="ts">
import { defineComponent, onMounted, ref } from "vue";
import { HtGlobe } from "ht-components";
import axios from 'axios'
function copyTextToClipboard(text) {
	navigator.clipboard.writeText(text).then(
		function () {
			console.log("Async: Copying to clipboard was successful!");
		},
		function (err) {
			console.error("Async: Could not copy text: ", err);
		}
	);
}
export default defineComponent({
	name: "harpgl",
	components: { HtGlobe },
	setup(props, { slots, emit }) {
		const tiandituTk = "7a801d6cd03da3cc229d90a6c8897e2a";
		let _onChange;
		const onLoaded = (viewer: Cesium.Viewer) => {
			let entities = []
			axios.post("")
			viewer.flyTo(czmlDataSource);
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
