<template>
	<div id="container">
		<div class="test1">hello,world</div>
	</div>
</template>
<script lang="ts">
import { defineComponent, onMounted } from "vue";

export default defineComponent({
	name: "harpgl",
	setup(props, { slots, emit }) {
		onMounted(() => {
			const canvas1 = document.createElement("canvas");
			document.getElementById("container").appendChild(canvas1);
			const ctx1 = canvas1.getContext("2d");
			const fontSize =32;
			const text = "hello,world";
			ctx1.font = fontSize + "px serif";
			const textMetrics = ctx1.measureText(text);
			console.log(textMetrics);
			let width = textMetrics.width;
			let height = fontSize / 0.7619047619047619;
			canvas1.width = width;
			canvas1.height = height;
			ctx1.font = fontSize + "px serif";
			ctx1.textAlign = "center";
			ctx1.textBaseline = "middle";
			ctx1.fillText(text, width / 2, height / 2);
		});
		return {};
	},
});
</script>
<style lang="scss">
.test {
	position: absolute;
	left: 100px;
	top: 100px;
	width: 200px;
	height: 200px;
	border-bottom: 2px solid #aaa; /*必须有这个属性*/
	background-color: #cbac1a;
	border-image-source: linear-gradient(90deg, #3066d2, #c8ebfc, #3066d2);
	border-image-slice: 2;
	border-image-repeat: repeat; /*repeat:平铺 round:根据情况放大或缩小 stretch:拉伸 	space:根据情况调整间隙平铺*/
}
.test1 {
	color: black;
	font-size: 19px;
}
canvas {
	// width: 88px;
	// height: 60px;
}
</style>
