<script lang="ts" setup>
import { MapShow } from "./map";
import { HtGlobe } from "ht-components";
import { onBeforeUnmount, ref } from "vue";
import Duty from "./components/Duty.vue";
import {
	planRouteFromCartesian3ToCartesian3,
	searchPoiByText,
} from "./czml/gaoDeRoutePlan";
function copyTextToClipboard(text) {
	navigator.clipboard.writeText(text).then(
		function () {
			console.log("Async: Copying to clipboard was successful!");
		},
		function (err) {
			console.error("Async: Could not copy text: ", err);
		}
	);
}
function consolePathList(name, pathList) {
	pathList[0].polyline = pathList[0].polyline.map((x) => [x.x, x.y, x.z]);
	console.log(name, JSON.stringify(pathList[0]));
}
const tiandituTk = "7a801d6cd03da3cc229d90a6c8897e2a";
// let mapshow: MapShow;
// const onLoaded = (viewer) => {
// 	mapshow = new MapShow(viewer);
// };
// onBeforeUnmount(() => {
// 	mapshow.destroy();
// 	mapshow = null;
// });
const createViewerOption = {
	timeline: true,
	animation: true,
	shouldAnimate: true,
};
let _onChange;
const onLoaded = (viewer: Cesium.Viewer) => {
	let czmlDataSource = Cesium.CzmlDataSource.load([
		{
			id: "document",
			version: "1.0",
		},
		{
			id: "test",
			orientation: {
				unitQuaternion: [0.0, 0.0, 0.0, 1.0],
			},
			position: {
				cartesian: [-2746999.338982754, 4762972.377498204, 3221610.240788856],
			},
			model: {
				gltf: "/data/models/Cesium_Man.glb",
			},
		},
	]);
	viewer.dataSources.add(czmlDataSource);
	_onChange = () => {
		czmlDataSource.then((dataSource) => {
			let entity = dataSource.entities.getById("test");
			console.log(entity);
			entity.orientation = new Cesium.ConstantProperty({
				x: quaternion.value[0],
				y: quaternion.value[1],
				z: quaternion.value[2],
				w: quaternion.value[3],
			});
		});
	};
	viewer.flyTo(czmlDataSource);
};
const quaternion = ref([0, 0, 0, 1.0]);
const copy = () => {
	copyTextToClipboard(JSON.stringify(quaternion.value));
};
const onChange = () => {
	_onChange();
};
const gaoDeKey = "2314ba9a5f02bf91a45e5c4b0cf10ae7";
const getRoute = () => {
	planRouteFromCartesian3ToCartesian3(
		new Cesium.Cartesian3(
			-2747002.792677326, 4762920.853284816, 3221682.9617121695
        ),
		new Cesium.Cartesian3(-2747647.4599156324, 4762633.300304891, 3221559.248033263),
		undefined,
		gaoDeKey
	).then((res) => {
		consolePathList("getRoute:", res);
	});
};
const placeName = ref("");
const placePosition = ref("");
const copyPlacePosition = () => {
	copyTextToClipboard(JSON.stringify(placePosition.value));
};
const geocode = () => {
	searchPoiByText(placeName.value, gaoDeKey).then((res) => {
		placePosition.value = res[0] + "," + res[1];
	});
};
</script>
<template>
	<HtGlobe
		:tiandituTk="tiandituTk"
		@loaded="onLoaded"
		:createViewerOption="createViewerOption"
	>
		<div class="tool">
			<el-tabs>
				<el-tab-pane label="调整quaternion" name="调整quaternion">
					<div class="tool-content">
						<div class="row">
							<div>x:</div>
							<el-slider
								:min="-1"
								:max="1"
								:step="0.0001"
								v-model="quaternion[0]"
								@change="onChange"
							></el-slider>
						</div>
						<div class="row">
							<div>y:</div>
							<el-slider
								:min="-1"
								:max="1"
								:step="0.0001"
								v-model="quaternion[1]"
								@change="onChange"
							></el-slider>
						</div>
						<div class="row">
							<div>z:</div>
							<el-slider
								:min="-1"
								:max="1"
								:step="0.0001"
								v-model="quaternion[2]"
								@change="onChange"
							></el-slider>
						</div>
						<div class="row">
							<div>w:</div>
							<el-slider
								:min="-1"
								:max="1"
								:step="0.0001"
								v-model="quaternion[3]"
								@change="onChange"
							></el-slider>
						</div>
						<div class="row">
							<div>结果：</div>
							<div>{{ quaternion }}</div>
						</div>
						<div class="row">
							<div></div>
							<el-button @click="copy">复制</el-button>
						</div>
					</div>
				</el-tab-pane>
				<el-tab-pane label="计算路线" name="计算路线">
					<div class="tool-content">
						<div class="row">
							<div></div>
							<el-button @click="getRoute">计算</el-button>
						</div>
					</div>
				</el-tab-pane>
				<el-tab-pane label="地理编码" name="地理编码">
					<div class="tool-content">
						<div class="row">
							<div>地名</div>
							<el-input v-model="placeName"></el-input>
						</div>
						<div class="row">
							<div></div>
							<el-button @click="geocode">计算</el-button>
						</div>
						<div class="row" @click="copyPlacePosition">
							<div>结果</div>
							<div>{{ placePosition }}</div>
						</div>
					</div>
				</el-tab-pane>
			</el-tabs>
		</div>
	</HtGlobe>
</template>

<style lang="scss" scoped>
#cesium-map {
	width: 100%;
	height: 100%;
}
.tool {
	z-index: 1;
	width: 30vw;
	position: absolute;
	right: 2vw;
	top: 10vh;
	background-color: white;
	padding: 20px;
	.tool-content {
		width: 20vw;
		box-sizing: border-box;
		.row {
			display: grid;
			grid-template-columns: 20% 80%;
			column-gap: 20px;
		}
	}
}
</style>
<style>
.popup {
	position: absolute;
	z-index: 1;
}
</style>
