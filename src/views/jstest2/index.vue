<template>
	<div id="container">
		<div class="test1">hello,world</div>
	</div>
</template>
<script lang="ts">
import { defineComponent, onMounted } from 'vue'
// import { str } from './test'
import axios from 'axios'
export default defineComponent({
	name: 'harpgl',
	setup(props, { slots, emit }) {
		onMounted(() => {
			const handlePrint = pdf => {
				if (document.getElementById('print-iframe')) {
					document.body.removeChild(document.getElementById('print-iframe'))
				}
				//判断iframe是否存在，不存在则创建iframe
				let iframe = document.getElementById('print-iframe')
				if (!iframe) {
					iframe = document.createElement('IFRAME')
					let doc = null
					iframe.setAttribute('src', pdf)
					iframe.setAttribute('id', 'print-iframe')
					document.body.appendChild(iframe)
					doc = iframe.contentWindow.document
					doc.close()
					iframe.contentWindow.focus()
				}
				iframe.contentWindow.print()
			}
			axios
				.get(
					'http://150.158.34.72:8099/api/pipeStat/exportLine?id=TBZ2QL1YZZBDL%2F%E5%BE%90%E5%B7%9E%E7%AE%A1%E7%BA%BF%E5%88%86%E6%9E%90%E6%9C%8D%E5%8A%A1N&field=%E6%9D%90%E8%B4%A8&project=xuzhou&type=2',
					{ responseType: 'blob' }
				)
				.then(res => {
					let pdfUrl = window.URL.createObjectURL(res.data)
					if (pdfUrl) {
						window.open(pdfUrl)
					}
				})
		})
		return {}
	},
})
</script>
<style lang="scss">
.test {
	position: absolute;
	left: 100px;
	top: 100px;
	width: 200px;
	height: 200px;
	border-bottom: 2px solid #aaa; /*必须有这个属性*/
	background-color: #cbac1a;
	border-image-source: linear-gradient(90deg, #3066d2, #c8ebfc, #3066d2);
	border-image-slice: 2;
	border-image-repeat: repeat; /*repeat:平铺 round:根据情况放大或缩小 stretch:拉伸 	space:根据情况调整间隙平铺*/
}
.test1 {
	color: black;
	font-size: 19px;
}
canvas {
	// width: 88px;
	// height: 60px;
}
</style>
