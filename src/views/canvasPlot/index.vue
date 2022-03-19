<template>
    <div id="military-plot"></div>
</template>
<script lang='ts'>
import { defineComponent, onMounted } from 'vue'
import { main } from './map'
import { HtGlobe } from 'ht-components'
export default defineComponent({
    name: "harpgl",
    components: { HtGlobe },
    setup(props, { slots, emit }) {
        onMounted(() => {
            main("military-plot")
        })
        return {}
    },
})
</script>
<style scoped>
#military-plot {
    width: 100%;
    height: 100%;
}
</style>