import routes from "~pages";
import { createRouter, createWebHashHistory } from "vue-router";
console.log(routes)
export const router = createRouter({
	routes,
	history: createWebHashHistory(),
});
