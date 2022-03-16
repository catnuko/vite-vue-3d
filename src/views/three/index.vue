<template>
    <canvas id="three-map" class="three-map"></canvas>
</template>
<script lang='ts'>
import { defineComponent, onMounted } from 'vue'
import { main } from './map'
export default defineComponent({
    name: "harpgl",
    setup(props, { slots, emit }) {
        onMounted(() => {
            main("three-map")
        })
        return {}
    },
})
</script>
<style scoped>
.three-map {
    width: 100%;
    height: 100%;
}
</style>