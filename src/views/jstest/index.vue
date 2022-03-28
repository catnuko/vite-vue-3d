<template></template>
<script lang='ts'>
import { defineComponent, onMounted } from 'vue'
export default defineComponent({
    name: "harpgl",
    setup(props, { slots, emit }) {
        const points = ['10号网格', '5号网格', '6号网格', '4号网格', '网格9', '11号网格', "号网格", '没有网格号'];
        points.sort(function (a, b) {
            const getAreaNum = (item) => {
                const hasNumber = /\d/g
                const testres = hasNumber.test(item)
                let result = 0
                if (testres) {
                    const res = item.match(/\d{1,20}/g)
                    result = Number(res[0])
                } else {
                    result = Number.POSITIVE_INFINITY
                }
                return result
            }
            const an = getAreaNum(a)
            const bn = getAreaNum(b)
            return an - bn
        });
        console.log(points)
        return {}
    },
})
</script>
<style scoped>
#cesium-map {
    width: 100%;
    height: 100%;
}
</style>