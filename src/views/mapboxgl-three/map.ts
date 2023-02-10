import mapboxgl from 'mapbox-gl'
import * as THREE from 'three'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
//@ts-ignore
import { GUI } from './lil-gui.module.min'
import { AfterimagePass } from './AfterimagePass'
import { HalftonePass } from './HalftonePass'
import { ColorPass } from './ColorPass'
mapboxgl.accessToken =
	'pk.eyJ1IjoiY2F0bnVrbyIsImEiOiJja2MwMDUxc2Iwa2RjMnFxcWk4c2cwcjQ5In0.VlIEyCroRFIp67cwUWLz1Q'
export class MapShow {
	constructor() {
		// add custom layer
		mapboxgl.accessToken =
			'pk.eyJ1IjoiY2F0bnVrbyIsImEiOiJja2MwMDUxc2Iwa2RjMnFxcWk4c2cwcjQ5In0.VlIEyCroRFIp67cwUWLz1Q'
		let map = new mapboxgl.Map({
			container: 'map',
			style: 'mapbox://styles/mapbox/dark-v10',
			zoom: 16,
			center: [-122.3491, 47.6207],
			pitch: 60,
			antialias: true, // create the gl context with MSAA antialiasing, so custom layers are antialiased
		})
		let modelOrigin = [-122.3491, 47.6207, 0]
		let modelAltitude = 100
		let modelRotate = [Math.PI / 2, 0, 0]
		let modelAsMercatorCoordinate = mapboxgl.MercatorCoordinate.fromLngLat(
			modelOrigin,
			modelAltitude
		)
		// transformation parameters to position, rotate and scale the 3D model onto the map
		let modelTransform = {
			translateX: modelAsMercatorCoordinate.x,
			translateY: modelAsMercatorCoordinate.y,
			translateZ: modelAsMercatorCoordinate.z,
			rotateX: modelRotate[0],
			rotateY: modelRotate[1],
			rotateZ: modelRotate[2],
			/* Since our 3D model is in real world meters, a scale transform needs to be
			 * applied since the CustomLayerInterface expects units in MercatorCoordinates.
			 */
			scale: modelAsMercatorCoordinate.meterInMercatorCoordinateUnits(),
		}

		let composer, cube
		let params = {
			enable: true,
		}

		// let THREE = window.THREE

		let customLayer = {
			id: '3d-model',
			type: 'custom',
			renderingMode: '3d',
			onAdd: function (map, gl) {
				this.camera = new THREE.Camera()
				this.scene = new THREE.Scene()
				this.map = map
				let ambientLight = new THREE.AmbientLight(0xffffff)
				this.scene.add(ambientLight)
				const loader = new GLTFLoader()
				loader.load(
					'https://docs.mapbox.com/mapbox-gl-js/assets/34M_17/34M_17.gltf',
					gltf => {
						console.log(gltf.scene)
						this.scene.add(gltf.scene)
					}
				)
				let geometry = new THREE.BoxBufferGeometry(50, 50, 50, 2, 2, 2)
				let material = new THREE.MeshPhongMaterial({
					color: '#049ef4',
					emissive: '#000000',
					specular: '#111111',
					shininess: 30,
					fog: true,
				})
				cube = new THREE.Mesh(geometry, material)
				// this.scene.add(cube)
				this.map = map

				// use the Mapbox GL JS map canvas for three.js
				this.renderer = new THREE.WebGLRenderer({
					canvas: map.getCanvas(),
					context: gl,
					antialias: true,
					preserveDrawingBuffer: false,
				})

				this.renderer.autoClear = false

				// add EffectComposer
				composer = new EffectComposer(this.renderer)
				composer.addPass(new RenderPass(this.scene, this.camera))

				const ap = new AfterimagePass()
				ap._realRender = ap.render
				ap.render = function (renderer) {
					renderer.setRenderTarget(this.textureComp)
					renderer.clear()
					this._realRender.apply(this, arguments)
				}
				// composer.addPass(ap)

				const params = {
					shape: 1,
					radius: 4,
					rotateR: Math.PI / 12,
					rotateB: (Math.PI / 12) * 2,
					rotateG: (Math.PI / 12) * 3,
					scatter: 0,
					blending: 1,
					blendingMode: 1,
					greyscale: false,
					disable: false,
				}
				const halftonePass = new HalftonePass(
					window.innerWidth,
					window.innerHeight,
					params
				)
				// composer.addPass(halftonePass)
				const params2 = {
					brightness: 0,
					contrast: 1,
					saturation: 1,
					opacity: 1,
				}
				const colorPass = new ColorPass(params2)
				composer.addPass(colorPass)
				this.gui = new GUI()
				this.gui.width = 350
				this.gui.add(params2, 'brightness').min(-1).max(1)
				this.gui.add(params2, 'contrast').min(0).max(2)
				this.gui.add(params2, 'saturation').min(0).max(2)
				this.gui.add(params2, 'opacity').min(0).max(1)
			},
			render: function (gl, matrix) {
				let rotationX = new THREE.Matrix4().makeRotationAxis(
					new THREE.Vector3(1, 0, 0),
					modelTransform.rotateX
				)
				let rotationY = new THREE.Matrix4().makeRotationAxis(
					new THREE.Vector3(0, 1, 0),
					modelTransform.rotateY
				)
				let rotationZ = new THREE.Matrix4().makeRotationAxis(
					new THREE.Vector3(0, 0, 1),
					modelTransform.rotateZ
				)

				let m = new THREE.Matrix4().fromArray(matrix)
				let l = new THREE.Matrix4()
					.makeTranslation(
						modelTransform.translateX,
						modelTransform.translateY,
						modelTransform.translateZ
					)
					.scale(
						new THREE.Vector3(
							modelTransform.scale,
							-modelTransform.scale,
							modelTransform.scale
						)
					)
					.multiply(rotationX)
					.multiply(rotationY)
					.multiply(rotationZ)

				this.camera.projectionMatrix = m.multiply(l)
				this.renderer.state.reset()

				cube.rotation.x += 0.005
				cube.rotation.y += 0.01

				// use composer
				composer.render()

				this.map.triggerRepaint()
			},
		}

		map.on('style.load', function () {
			map.addLayer(customLayer)
		})
	}
}
