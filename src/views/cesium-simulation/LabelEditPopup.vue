<script lang="ts" setup>
import { ElMessage } from "element-plus";
import { onBeforeUnmount, PropType, ref, watch } from "vue";
const props = defineProps({
	symbol: Object as PropType<{
		text: string;
		color: string;
		fontSize: number;
	}>,
});
const symbol = ref({
	text: "",
	color: "rgba(255,255,255,255)",
	fontSize: 25,
});
watch(
	() => props.symbol,
	(news) => {
		symbol.value = news;
	},
	{ immediate: true }
);
const emits = defineEmits(["symbolChange", "over"]);
const onKeyUp = (evt) => {
	if (evt.keyCode == "13") {
		if (symbol.value.text) {
			emits("over", symbol.value);
		}else{
			ElMessage.warning("请输入文本")
		}
	}
};
window.addEventListener("keyup", onKeyUp);
onBeforeUnmount(() => {
	window.removeEventListener("keyup", onKeyUp);
});
const symbolChange = () => {
	emits("symbolChange", symbol.value);
};
const formatTooltip = (val: number) => {
	return `${val}px`;
};
</script>
<template>
	<div class="label-edit-popup popup">
		<div class="item">
			<div class="label">文本:</div>
			<el-input placeholder="..." v-model="symbol.text" @input="symbolChange"></el-input>
		</div>
		<div class="item">
			<div class="label">文字颜色:</div>
			<el-color-picker v-model="symbol.color" show-alpha @change="symbolChange" />
		</div>
		<div class="item">
			<div class="label">文字大小:</div>
			<el-slider
				:step="1"
				show-stops
				v-model="symbol.fontSize"
				:min="14"
				:max="32"
				:format-tooltip="formatTooltip"
				@input="symbolChange"
			/>
		</div>
	</div>
</template>
<style lang="scss">
.label-edit-popup {
	display: flex;
	flex-direction: column;
	align-items: flex-start;
	position: absolute;
	z-index: 1;
	box-sizing: border-box;
	background-color: rgba(25, 43, 47, 1);
	border: 0.01rem solid #51909b;
	border-radius: 1%;
	padding: 20px;
	.item {
		display: grid;
		grid-template-columns: 38% 62%;
		width: 100%;
		margin-bottom: 10px;
		.label {
			color: white;
			font-size: 14px;
		}
	}
}
</style>
