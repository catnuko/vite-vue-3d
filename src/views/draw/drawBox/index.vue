<script setup lang="ts">
import { inject, ref } from 'vue'
import { DrawCommand, configList } from './draw'
import Cesium from 'dtcesium'
const viewerPromise = inject<Promise<Cesium.Viewer>>("viewerPromise")
let drawCommand: DrawCommand
viewerPromise.then(viewer => {
    drawCommand = new DrawCommand(viewer)
})
const activeName = ref()
const activeDrawCommandName = ref("")

const handleClick = (val) => {
    console.log(val, 'is clicked')
}
const draw = () => {
    const config = configList.find(x => x.name === activeDrawCommandName.value)
    if (config) {
        drawCommand.draw(config.geometryCommandName)
    }
}
</script>
<template>
    <div class="draw-box">
        <el-tabs v-model="activeName" class="demo-tabs" @tab-click="handleClick">
            <el-tab-pane label="标绘工具" name="标绘工具">
                <div class="draw-tool">
                    <div class="draw-command-box">
                        <div
                            v-for="item in configList"
                            class="draw-command"
                            :class="activeDrawCommandName === item.name ? 'active' : ''"
                            @click="activeDrawCommandName = item.name"
                        >
                            <img :src="item.img" :alt="item.name" />
                            <div>{{ item.name }}</div>
                        </div>
                    </div>
                    <el-button type="primary" @click="draw">绘制</el-button>
                    <div></div>
                    <div></div>
                </div>
            </el-tab-pane>
            <el-tab-pane label="数据打点" name="数据打点">数据打点</el-tab-pane>
        </el-tabs>
    </div>
</template>
<style scoped lang="scss">
.draw-box {
    position: absolute;
    right: 5vw;
    top: 5vh;
    z-index: 1;
    .draw-tool {
        width: 15vw;
        .draw-command-box {
            display: grid;
            grid-template-columns: repeat(4, 25%);
            .active.draw-command {
                border: 1px solid blue;
            }
            .draw-command {
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: flex-start;
                flex-direction: column;
                width: fit-content;
                img {
                    width: 1vw;
                    height: 1vw;
                }
            }
        }
    }
}
</style>