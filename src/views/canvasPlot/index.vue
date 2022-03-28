<template>
    <img
        class="bk-img"
        src="https://www.jlgao.cn/zhd/dqga/images/%E9%A2%84%E6%A1%88%E4%B8%8A%E5%9B%BE/u1.png"
    />
    <div id="military-plot"></div>

    <div class="btn-group">
        <el-select v-model="currentOption">
            <el-option
                v-for="item in options"
                :key="item.label"
                :label="item.label"
                :value="item.type"
            ></el-option>
        </el-select>
        <el-button @click="draw">开始绘制</el-button>
        <el-button @click="getFeatures">获取Feature</el-button>
    </div>
</template>
<script lang='ts'>
import { defineComponent, onMounted, ref } from 'vue'
import { main, active, getFeatures } from './map'
import { HtGlobe } from 'ht-components'
import { plotType } from '../../../../../zhonghaida/dqga/src/components/cl/sandTable/indoor/plotType'
export default defineComponent({
    name: "harpgl",
    components: { HtGlobe },
    setup(props, { slots, emit }) {
        onMounted(() => {
            main("military-plot")
        })
        const currentOption = ref("")
        const draw = () => {
            active && active(currentOption.value)
        }
        return { options: plotType, currentOption, draw, getFeatures }
    },
})
</script>
<style scoped>
.bk-img {
    width: 100%;
    height: 100%;
    position: absolute;
    z-index: 1;
}
#military-plot {
    width: 100%;
    height: 100%;
    z-index: 2;
    position: absolute;
}
.ol-viewport {
    /*完全透明*/
    /*background-color: rgba(0, 0, 0, 0);*/
    /*完全不透明*/
    background-color: rgba(0, 0, 0, 1);
}
.btn-group {
    z-index: 3;
    position: absolute;
    right: 5vw;
    top: 10vh;
    background-color: white;
}
</style>
