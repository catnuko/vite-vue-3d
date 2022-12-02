<script setup lang="ts">
import { onBeforeUnmount, onMounted } from "vue";
import { main, makeSvgId } from "./map";
let id = makeSvgId();
let mapshow;
onMounted(() => {
	main(id, "乡镇详情")
		.then((_mapshow) => {
			mapshow = _mapshow;
			// mapshow.on(mapshow.EVENT.LABEL_CLICK, function (data) {
			//   console.log(data)
			//   if (data.properties['乡'] === '柳市镇') {
			//     mapshow.switchLayer(data)
			//   } else {
			//     console.error(data)
			//   }
			// })
		})
		.catch((e) => {
			console.error(e);
		});
});
onBeforeUnmount(() => {
	mapshow && mapshow.destroy();
});
</script>
<template>
	<div :id="id" style="width: 100vw; height: 100vh"></div>
</template>
<style>
#svg-map {
	position: absolute;
	top: 0;
	height: 100vh;
	width: 100vw;
	display: flex;
	justify-content: center;
	align-items: center;
	/* background-color: black; */
}
</style>
