import { Scene, PerspectiveCamera, WebGLRenderer, Clock, AxesHelper, Matrix4, Group } from "three";
import * as THREE from "three";
import Controler from "three-orbit-controls";
import { composeScene, params, createUI } from "./tile";
export function main(id: string) {
	const width = window.innerWidth;
	const height = window.innerHeight;
	const canvas = document.getElementById(id) as HTMLCanvasElement;
	const scene = new Scene();
	const camera = new THREE.PerspectiveCamera(60, width / height, 0.01, 100);
	camera.position.set(0, 6, 15);
	const renderer = new WebGLRenderer({ canvas });
	var axesHelper = new AxesHelper(5);
	scene.add(axesHelper);
	const NewControler = Controler(THREE);
	new NewControler(camera);

	const mesh = new THREE.Mesh(
		new THREE.BoxGeometry(1, 1, 1),
		new THREE.MeshBasicMaterial({ color: 0xff0000, wireframe: true })
	);
	scene.add(mesh);

	const gridHelper = new THREE.GridHelper(50, 50);
	scene.add(gridHelper);

	renderer.setSize(window.innerWidth, window.innerHeight);
	document.body.appendChild(renderer.domElement);


	function render() {
		renderer.render(scene, camera);
		window.requestAnimationFrame(render);
	}
	render();

	// createUI(scene, params);
	composeScene(scene, params);
}
