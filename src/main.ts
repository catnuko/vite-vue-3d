import { createApp } from "vue";
import App from "./App.vue";
import "dtcesium/widgets.css";
import { router } from "./router";
import ElementPlus from "element-plus";
// import 'element-plus/lib/theme-chalk/index.css'
import 'element-plus/theme-chalk/index.css'
createApp(App).use(ElementPlus).use(router).mount("#app");
