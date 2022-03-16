import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import Pages from "vite-plugin-pages";

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [vue(), Pages({ dirs: "src/views", exclude: ["**/*.ts"] })],
	base: "./",
	build: {
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
