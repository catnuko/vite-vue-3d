import Cesium from 'dtcesium'
import {Editor,Plot} from './LabelEntity'

export  class MapShow{
    readonly editor:Editor
    readonly plot:Plot
    constructor(readonly viewer:Cesium.Viewer) {
        this.editor = new Editor(viewer)
        this.editor.setEnable(true)
        this.plot = new Plot(viewer)
        this.plot.active("LabelPlot")
    }
    destroy(){
        this.editor.destroy()
        this.plot.deactive()
    }
}
