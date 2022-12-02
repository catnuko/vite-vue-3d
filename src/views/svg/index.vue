<template>
	<div id="container"></div>
</template>
<script lang="ts">
import { defineComponent, onMounted } from "vue";
import { makeSvg } from "./svg";
import * as d3 from "d3";
export default defineComponent({
	name: "harpgl",
	setup(props, { slots, emit }) {
		onMounted(() => {
			let div = document.getElementById("container");
			let svg = makeSvg();
			const arc = d3.arc().innerRadius().outerRadius(100).startAngle(0).endAngle(1);
			d3.select("#container").append("svg").attr("width", 134).attr("height", 119).append("path").attr("d");
			div.innerHTML = svg;
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
