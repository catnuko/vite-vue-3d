import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import Pages from "vite-plugin-pages";
import legacy from "@vitejs/plugin-legacy";
import vitePluginString from "vite-plugin-string";

// https://vitejs.dev/config/
export default defineConfig({
	resolve: {
		alias: {
			"^dayjs$": "node_modules/dayjs/dayjs.min.js",
			"rbush": __dirname + "/node_modules/rbush/rbush.js"
		},
	},
	plugins: [
		vue(),
		Pages({
			dirs: "src/views",
			exclude: ["**/*.ts", "**/*.js"],
		}),
		// legacy({
		// 	targets: ["chrome 52"], // 需要兼容的目标列表，可以设置多个
		// 	additionalLegacyPolyfills: ["regenerator-runtime/runtime"], // 面向IE11时需要此插件
		// }),
		vitePluginString({
			compress: false,
		}),
	],
	base: "./",
	build: {
		target: "es2020",
		assetsDir: "assets",
	},
	server: {
		proxy: {
			"/3Dtile": {
				target: "http://localhost:8002",
				changeOrigin: true,
			},
			"/streetTileSet": {
				target: "https://int.nyt.com/data/3dscenes/ONA360/TILESET/0731_FREEMAN_ALLEY_10M_A_36x8K__10K-PN_50P_DB",
				changeOrigin: true,
			},
			"/SampleData": {
				target: "https://sandcastle.cesium.com",
				changeOrigin: true,
			},
		},
	},
});
