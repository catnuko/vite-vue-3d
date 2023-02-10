<template>
	<div class="container" id="map"></div>
</template>
<script lang="ts" setup>
import 'mapbox-gl/dist/mapbox-gl.css'
import { MapShow } from './map'
import { onMounted } from 'vue'
onMounted(() => {
	new MapShow()
})
</script>
<style lang="scss" scoped>
#map {
	width: 100%;
	height: 100%;
}
</style>
