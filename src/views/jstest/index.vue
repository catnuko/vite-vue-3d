<template>
  <div id="container">
    <div class="test"></div>
  </div>
</template>
<script lang='ts'>
import {defineComponent, onMounted} from 'vue'

export default defineComponent({
  name: "harpgl",
  setup(props, {slots, emit}) {
    return {}
  },
})
</script>
<style scoped>
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

</style>
