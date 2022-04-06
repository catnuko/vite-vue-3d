<script setup lang="ts">
import {onBeforeUnmount, onMounted} from 'vue';
import {main} from './map'

let mapshow
onMounted(() => {
  main("svg-map").then(_mapshow => {
    mapshow = _mapshow
    mapshow.on(mapshow.EVENT.LABEL_CLICK, function (data) {
      console.log(data)
      if (data.properties['乡'] === '柳市镇') {
        mapshow.switchLayer(data)
      } else {
        console.error(data)
      }
    })
  })
})
onBeforeUnmount(() => {
  mapshow && mapshow.destroy()
})
</script>
<template>
  <div id="svg-map" style="width: 100vw;height: 100vh;"></div>
</template>
<style></style>

