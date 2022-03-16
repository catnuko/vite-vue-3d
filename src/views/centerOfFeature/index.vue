<template>centerOfFeature</template>
<script lang='ts'>
import { defineComponent, onMounted } from 'vue'
import { main } from './index'
export default defineComponent({
    name: "harpgl",
    setup(props, { slots, emit }) {
        onMounted(() => {
            main()
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