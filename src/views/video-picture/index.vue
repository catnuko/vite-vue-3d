<template>
	<!-- <img :src="record.url" /> -->
	<canvas id="testCanvas"></canvas>
</template>
<script setup>
import { onMounted } from "vue";
import { record } from "./data";
console.log(record);
onMounted(() => {
	let canvas = document.getElementById("testCanvas");
	let ctx = canvas.getContext("2d");
	let img = document.createElement("img");
	img.src = record.url;
	img.onload = function () {
		ctx.drawImage(img, 0, 0, 900, 600);
	};
});
</script>
<style lang="scss" scoped>
#testCanvas {
	width: 900px;
	height: 600px;
	border: 1px solid black;
}
</style>
