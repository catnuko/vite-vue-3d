<template>
    <div id="cesium-map"></div>
</template>
<script lang='ts'>
import { defineComponent, onMounted } from 'vue'
import { main } from './map'
import { HtGlobe } from 'ht-components'
export default defineComponent({
    name: "harpgl",
    components: { HtGlobe },
    setup(props, { slots, emit }) {
        const tiandituTk = "1292dbbb36f799c61eabc3c732eef02c";
        onMounted(() => {
            main("cesium-map", tiandituTk)
        })
        return { tiandituTk }
    },
})
</script>
<style scoped>
#cesium-map {
    width: 100%;
    height: 100%;
}
</style>