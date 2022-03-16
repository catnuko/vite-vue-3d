<template>
    <canvas id="map" class="harp-map"></canvas>
</template>
<script lang='ts'>
import { MapView } from '@here/harp-mapview'
import { defineComponent, onBeforeUnmount, onMounted } from 'vue'
import { makeMap } from './map'
export default defineComponent({
    name: "harpgl",
    setup(props, { slots, emit }) {
        let map: MapView
        onMounted(() => {
            map = makeMap("map")
        })
        onBeforeUnmount(() => {
            map && map.dispose()
        })
        return {}
    },
})
</script>
<style scoped>
.harp-map {
    width: 100%;
    height: 100%;
}
</style>