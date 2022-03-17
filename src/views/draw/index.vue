<template>
    <ht-globe :tianditu-tk="tiandituTk" @loaded="onLoaded">
        <draw-box></draw-box>
    </ht-globe>
</template>
<script lang='ts'>
import { defineComponent, onMounted } from 'vue'
import { main } from './map'
import { HtGlobe } from 'ht-components'
import DrawBox from './drawBox/index.vue'
export default defineComponent({
    name: "harpgl",
    components: { HtGlobe, DrawBox },
    setup(props, { slots, emit }) {
        const tiandituTk = "1292dbbb36f799c61eabc3c732eef02c";
        const onLoaded = viewer => {
            main(viewer)
        }
        return { tiandituTk, onLoaded }
    },
})
</script>
<style scoped>
#cesium-map {
    width: 100%;
    height: 100%;
}
</style>