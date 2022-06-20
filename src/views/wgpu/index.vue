<template>
	<canvas class="wgpu" :id="ID"></canvas>
	<div class="tools">
		<el-select @change="onChange" v-model="value">
			<el-option v-for="item in options" :key="item.label" :value="item.label" :label="item.label"> </el-option>
		</el-select>
	</div>
</template>
<script setup>
import { ref } from "vue";
import triangle from "./examples/triangle/main";
import triangleMSAA from "./examples/triangleMSAA/main";
import rotatingCube from "./examples/rotatingCube/main";
import rotatingCubeMSAA from "./examples/rotatingCubeMSAA/main";
import twoCube from "./examples/twoCube/main";
import texturedCube from "./examples/texturedCube/main";
import fractalCube from "./examples/fractalCube/main";
import cubeMap from "./examples/cubeMap/main";
import deferredRendering from "./examples/deferredRendering/main";
import shadowMapping from "./examples/shadowMapping/main";
const ID = "wgpu";
const options = ref([
	{
		label: "triangle",
		constructor: triangle,
	},
	{
		label: "triangleMSAA",
		constructor: triangleMSAA,
	},
	{
		label: "rotatingCube",
		constructor: rotatingCube,
	},
	{
		label: "rotatingCubeMSAA",
		constructor: rotatingCubeMSAA,
	},
	{
		label: "twoCube",
		constructor: twoCube,
	},
	{
		label: "texturedCube",
		constructor: texturedCube,
	},
	{
		label: "fractalCube",
		constructor: fractalCube,
	},
	{
		label: "cubeMap",
		constructor: cubeMap,
	},
	{
		label: "deferredRendering",
		constructor: deferredRendering,
	},
	{
		label: "shadowMapping",
		constructor: shadowMapping,
	},
]);
const value = ref("");
let last;
const onChange = (value) => {
	if (last) {
		last.destroy();
		last = null;
	}
	const item = options.value.find((i) => i.label === value);
	if (item) {
		last = new item.constructor(ID);
	}
};
</script>
<style>
.wgpu {
	width: 100vw;
	height: 100vh;
	border: 1px solid black;
	z-index: 0;
}
.tools {
	z-index: 1;
	top: 3vh;
	position: absolute;
	left: 1vw;
	width: 10vw;
}
</style>
