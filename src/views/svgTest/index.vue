<template>
	<div class="container">
		<div v-for="item in list" :key="item.label" class="item">
			<img :src="item.src" />
			<div>{{ item.label }}</div>
		</div>
		<div class="item">
			<img src="/resources/test.gif" />
			<div>测试gif</div>
		</div>
	</div>
</template>
<script setup>
import { ref } from "vue";
import { SVG } from "./main";
let list = ref([]);
console.log(SVG);
for (let key in SVG) {
	list.value.push({
		label: key,
		src: SVG[key],
	});
}
</script>
<style lang="scss" scoped>
.container {
	width: 100vw;
	height: 100vh;
	display: flex;
	.item {
		display: flex;
		flex-direction: column;
		justify-content: flex-start;
		align-items: center;
	}
}
</style>
