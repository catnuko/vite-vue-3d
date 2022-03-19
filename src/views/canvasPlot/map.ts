import { Map, View } from "ol";
import { DragRotateAndZoom, defaults as defaultInteractions } from "ol/interaction";
import olPlot from "./plot";
export let active, getFeatures;
export function main(id: string) {
	const map = new Map({
		layers: [
			// new TileLayer({
			// 	source: new OSM(),
			// }),
		],
		view: new View({
			// center: [108.93, 34.27],
			center: [12095486.34146684, 4085090.6140265367],
			projection: "EPSG:3857",
			zoom: 5,
		}),
		target: id,
		interactions: defaultInteractions({
			doubleClickZoom: false, // 取消双击放大功能交互
			mouseWheelZoom: false, // 取消滚动鼠标中间的滑轮交互
			shiftDragZoom: false, // 取消shift+wheel左键拖动交互
			dragPan: false,
		}),
	});

	/* eslint-disable-next-line */
	const plot = new olPlot(map, {
		zoomToExtent: true,
	});

	map.on("click", function (event) {
		console.log(event);
		const feature = map.forEachFeatureAtPixel(event.pixel, function (feature) {
			return feature;
		});
		if (feature && feature.get("isPlot") && !plot.plotDraw.isDrawing()) {
			plot.plotEdit.activate(feature);
		} else {
			plot.plotEdit.deactivate();
		}
	});

	// 绘制结束后，添加到FeatureOverlay显示。
	function onDrawEnd(event) {
		const feature = event.feature;
		// 开始编辑
		plot.plotEdit.activate(feature);
	}

	plot.plotDraw.on("drawEnd", onDrawEnd);
	plot.plotDraw.on("active_textArea", function (event) {
		const style = plot.plotUtils.getPlotTextStyleCode(event.overlay);
		console.log(style);
	});

	// 指定标绘类型，开始绘制。
	function _activate(type) {
		plot.plotEdit.deactivate();
		plot.plotDraw.active(type);
	}

	function _getFeatures() {
		const features = plot.plotUtils.getFeatures();
		console.log(JSON.stringify(features));
		plot.plotUtils.removeAllFeatures();
		plot.plotEdit.deactivate();
		plot.plotUtils.addFeatures(features);
	}
	active = _activate;
	getFeatures = _getFeatures;
	// activate(olPlot.PlotTypes.ATTACK_ARROW)
}
