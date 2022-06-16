<template>
	<div class="front-map">
		这是工作人员的任务
		<div class="step">
			<div class="step-title">触发事件</div>
			<div class="step-content">
				<el-button v-for="item in eventOption" :key="item.name" @click="onClick(item)">{{ item.name }}</el-button>
			</div>
		</div>
		<div class="workFlow" v-for="workFlow in workFlowList">
			<div class="workFlow-title">{{ workFlow.title }}</div>
			<el-steps direction="vertical" :active="1">
				<el-step
					v-for="item in workFlow.steps"
					:title="`${item.num}:${item.title}`"
					:description="item.content"
				></el-step>
			</el-steps>
		</div>
	</div>
</template>
<script setup>
import { onMounted, onBeforeUnmount, ref } from "vue";
import { mitter, EVENT } from "../mitt";
function onPageEvent(eventOptions) {
	for (let evt of eventOptions) {
		mitter.on(evt.type, evt.handler);
	}
	onBeforeUnmount(() => {
		for (let evt of eventOptions) {
			mitter.off(evt.type, evt.handler);
		}
	});
}
let eventOption = [
	{
		name: "火灾",
		position: new Cesium.Cartesian3(-2746755.964908814, 4763531.546831209, 3220993.289047467),
	},
	{
		name: "斗殴",
		position: new Cesium.Cartesian3(-2746755.964908814, 4763531.546831209, 3220993.289047467),
	},
	{
		name: "交通事故",
		position: new Cesium.Cartesian3(-2746755.964908814, 4763531.546831209, 3220993.289047467),
	},
];
const workFlowList = ref([]);
const onClick = (item) => {
	mitter.emit(EVENT.WORKFLOW_EVENT, { item });
};
onMounted(() => {
	onPageEvent([
		{
			type: EVENT.PANEL_SHOW_ADD_WORKFLOW,
			handler: ({ title, steps }) => {
				workFlowList.value.push({ title, steps: steps || [] });
			},
		},
		{
			type: EVENT.PANEL_SHOW_ADD_STEP,
			handler: ({ workerFlowId, num, title, content }) => {
				if (workerFlowId) {
					const workFlow = workFlowList.value.find((x) => x.workerFlowId === workerFlowId);
					if (workFlow) {
						workFlow.steps.splice(num - 1, 1, { num, title, content });
					}
				}
			},
		},
	]);
});
</script>
<style lang="scss">
.front-map {
	position: absolute;
	z-index: 1;
	right: 5vw;
	top: 5vh;

	width: 20vw;

	background-color: white;
	color: black;
	padding: 10px;
	border-radius: 5px;
}
.step {
	margin: 10px, 0px;
	padding: 5px;
	&-title {
	}
	&-content {
	}
}
</style>
