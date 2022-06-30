import { cameraFlyTo, debugPosition } from "ht-cesium-utils"
import * as Helper from '../cesium-czml/helper'
const viewLibrary = {
    china: {
        destination: [-3605512.105699924, 26686989.936434574, 10998431.27978446,],
        hpr: [6.283185307179586, -1.5694775890277204, 0,]
    },
    sswh: {
        destination: [-2815634.9655012125, 4885491.891794013, 3098215.2354594874,],
        hpr: [6.283185307178744, -0.7854092651685538, 6.283185307179572,]
    }
}
export class MapShow {
    viewer: Cesium.Viewer
    constructor(viewer) {
        this.viewer = viewer
        // 是否支持图像渲染像素化处理
        if (Cesium.FeatureDetection.supportsImageRenderingPixelated()) {
            viewer.resolutionScale = window.devicePixelRatio
        }
        // 开启抗锯齿
        viewer.scene.postProcessStages.fxaa.enabled = true;

        console.log(viewer)
        debugPosition(viewer)
        this.init()
    }
    async init() {
        let start = Cesium.JulianDate.addSeconds(Cesium.JulianDate.now(), 3, new Cesium.JulianDate())
        let [startShowLabel, startFlyToSSWH] = Helper.incrementJulianDateList(start, [3, 1])
        let end = Cesium.JulianDate.addHours(start, 1, new Cesium.JulianDate());
        this.viewer.clock.startTime = start
        this.viewer.clock.stopTime = end
        this.viewer.clock.currentTime = start
        //设置时间
        const showLabel = new Helper.CzmlTimeInterval({ start: startShowLabel, end: end, })
        showLabel.add({
            id: "sswh-label",
            position: {
                cartographicDegrees: [119.98191, 29.458741, 100]
            },
            point: {
                pixelSize: 20,
                color: {
                    rgba: [255, 255, 255, 255]
                },
                outlineColor: {
                    rgba: [255, 0, 0, 255]
                },
                outlineWidth: 5,
            },
            label: {
                pixelOffset: {
                    cartesian2: [0, -40]
                },
                text: "上山文化遗址",
                fillColor: {
                    rgba: [255, 255, 0, 255]
                }
            }
        })
        let show = new Helper.CzmlTimeIntervalShow(
            [
                showLabel,
                Helper.createView(start, viewLibrary.china),
                Helper.createView(startFlyToSSWH, viewLibrary.sswh)
            ]
        )
        show.setViewer(this.viewer)
    }
}
