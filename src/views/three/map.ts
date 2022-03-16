import { Scene, PerspectiveCamera, WebGLRenderer, Clock, AxesHelper, Matrix4, Group } from "three";
import * as THREE from "three";
import { Loader3DTiles, PointCloudColoring } from "../../lib/three-loader-3dtiles/dist/three-loader-3dtiles.esm.js";
import Controler from "three-orbit-controls";
export function main(id: string) {
	const width = window.innerWidth;
	const height = window.innerHeight;
	const canvas = document.getElementById(id) as HTMLCanvasElement;
	const scene = new Scene();
	const camera = new THREE.PerspectiveCamera(60, width / height, 0.01, 100);
	camera.position.set(0, 1, -3);
	camera.lookAt(new THREE.Vector3());
	const renderer = new WebGLRenderer({ canvas });
	const clock = new Clock();
	var axesHelper = new AxesHelper(5);
	scene.add(axesHelper);
	const NewControler = Controler(THREE);
	const constrol = new NewControler(camera);

	const mesh = new THREE.Mesh(
		new THREE.BoxGeometry(1, 1, 1),
		new THREE.MeshBasicMaterial({ color: 0xff0000, wireframe: true })
	);
	scene.add(mesh);

	const gridHelper = new THREE.GridHelper(50, 50);
	gridHelper.position.y = -1;
	scene.add(gridHelper);

	renderer.setSize(window.innerWidth, window.innerHeight);
	document.body.appendChild(renderer.domElement);

	let tilesRuntime = null;
	const ION_TOKEN =
		"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJlYWMxMzcyYy0zZjJkLTQwODctODNlNi01MDRkZmMzMjIxOWIiLCJpZCI6OTYyMCwic2NvcGVzIjpbImFzbCIsImFzciIsImdjIl0sImlhdCI6MTU2Mjg2NjI3M30.1FNiClUyk00YH_nWfSGpiQAjR5V2OvREDq1PJ5QMjWQ";
	async function loadTileset() {
		const result: { model: Group; runtime: any } = await Loader3DTiles.load({
			// url: "https://int.nyt.com/data/3dscenes/ONA360/TILESET/0731_FREEMAN_ALLEY_10M_A_36x8K__10K-PN_50P_DB/tileset_tileset.json",
			url: "/SampleData/Cesium3DTiles/Tilesets/Tileset/tileset.json",
			renderer: renderer,
			options: {
				dracoDecoderPath: "https://unpkg.com/three@0.133.0/examples/js/libs/draco",
				basisTranscoderPath: "https://unpkg.com/three@0.133.0/examples/js/libs/basis",
			},
			// url: `https://assets.cesium.com/43978/tileset.json`,
			// renderer: renderer,
			// options: {
			// 	cesiumIONToken: ION_TOKEN,
			// 	dracoDecoderPath: "https://unpkg.com/three@0.133.0/examples/js/libs/draco",
			// 	pointCloudColoring: PointCloudColoring.RGB,
			// 	maximumScreenSpaceError: 6,
			// },
		});
		const { model, runtime } = result;
		const tileset = runtime.getTileset();
		console.log(model,runtime,tileset);
		tilesRuntime = runtime;

		const center = [1215020.3070048532, -4736341.964729419, 4081630.3090666793];
		const m4 = new Matrix4().makeTranslation(...center).invert();
		model.applyMatrix4(m4);

		scene.add(model);
	}

	function render() {
		const dt = clock.getDelta();
		if (tilesRuntime) {
			tilesRuntime.update(dt, renderer, camera);
			const tileset = tilesRuntime.getTileset();
			console.log(tileset.root._distanceToCamera);
		}
		renderer.render(scene, camera);
		window.requestAnimationFrame(render);
	}
	loadTileset();
	render();
}
