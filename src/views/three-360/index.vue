<template>
	<canvas id="three-360" class="three-360"></canvas>
</template>
<script lang="ts" setup>
import { defineComponent, onMounted } from 'vue'
import { MapShow } from './map'
//https://juejin.cn/post/7037342016266567711
onMounted(() => {
	new MapShow('three-360')
})
</script>
<style scoped>
.three-360 {
	width: 100%;
	height: 100%;
}
</style>
