import {
	Scene,
	PerspectiveCamera,
	WebGLRenderer,
	Clock,
	AxesHelper,
	Matrix4,
	Group,
} from 'three'
import * as THREE from 'three'
import Controler from 'three-orbit-controls'
const RADIUS = 16
export class MapShow {
	renderer: THREE.Renderer
	scene: THREE.Scene
	camera: THREE.Camera
	constructor(readonly id: string) {
		this.initThree(id)
		this.initContent2()
	}
	render() {
		this.renderer.render(this.scene, this.camera)
		window.requestAnimationFrame(this.render)
	}
	initContent() {
		let fileList = this.getFileList()
		let boxList = fileList.map(x => this.makeBox(x))
		let testBox = boxList[0]
		testBox.geometry.scale(-1, 1, 1)
		this.scene.add(testBox)
		const boxHelper = new THREE.BoxHelper(testBox, 0xffff00)
		this.scene.add(boxHelper)
	}
	initContent2() {
		let fileList = this.getFileList()
		let sphereList = fileList.map(x => this.makeSphere(x))
		let sphere = sphereList[0]
		sphere.geometry.scale(-1, 1, 1)
		this.scene.add(sphere)
	}
	getFileList() {
		let list: BoxTexture[] = []
		for (let i = 1; i < 2; i++) {
			list.push({
				name: `${i}.jpg`,
				path: `./data/全景照片/${i}.jpg`,
				left: `./data/全景照片/${i}.left.jpg`,
				right: `./data/全景照片/${i}.right.jpg`,
				top: `./data/全景照片/${i}.top.jpg`,
				bottom: `./data/全景照片/${i}.bottom.jpg`,
				front: `./data/全景照片/${i}.front.jpg`,
				back: `./data/全景照片/${i}.back.jpg`,
			})
		}
		return list
	}
	makeBox(boxTexture: BoxTexture) {
		let picList = ['left', 'right', 'top', 'bottom', 'front', 'back']
		let boxGeometry = new THREE.BoxGeometry(10, 10, 10)
		let boxMaterials = []
		picList.forEach(item => {
			let texture = new THREE.TextureLoader().load(boxTexture[item])
			boxMaterials.push(new THREE.MeshBasicMaterial({ map: texture }))
		})
		const box = new THREE.Mesh(boxGeometry, boxMaterials)
		return box
	}
	makeSphere(boxTexture: BoxTexture) {
		let sphereGeometry = new THREE.SphereGeometry(RADIUS, 50, 50)
		let texture = new THREE.TextureLoader().load(boxTexture.path)
		let sphereMaterial = new THREE.MeshBasicMaterial({ map: texture })
		const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial)
		return sphere
	}
	initThree(id: string) {
		const canvas = document.getElementById(id) as HTMLCanvasElement
		const scene = new Scene()
		const camera = new THREE.PerspectiveCamera(
			60,
			canvas.clientWidth / canvas.clientHeight,
			0.01,
			100
		)
		camera.position.set(-1, 0, 0)
		camera.lookAt(new THREE.Vector3(10, 0, 0))
		const renderer = new WebGLRenderer({ canvas })
		var axesHelper = new AxesHelper(5)
		scene.add(axesHelper)
		// const gridHelper = new THREE.GridHelper(50, 50)
		// scene.add(gridHelper)

		renderer.setSize(window.innerWidth, window.innerHeight)
		this.scene = scene
		this.renderer = renderer
		this.camera = camera
		this.render = this.render.bind(this)
		this.render()
		this.initControl()
	}
	initControl() {
		const NewControler = Controler(THREE)
		const controls = new NewControler(this.camera)
		controls.enableDamping = true // 使动画循环使用时阻尼或自转 意思是否有惯性
		controls.dampingFactor = 1 // 动态阻尼系数 就是鼠标拖拽旋转灵敏度
		controls.enableZoom = true // 是否可以缩放
		controls.autoRotate = false // 是否自动旋转
		controls.minDistance = 0 // 设置相机距离原点的最近距离
		controls.maxDistance = 50 // 设置相机距离原点的最远距离
		controls.enablePan = false // 是否开启右键拖拽
	}
}
export interface BoxTexture {
	name: string
	path: string
	left: string
	right: string
	top: string
	bottom: string
	front: string
	back: string
}
