import { ShaderMaterial, UniformsUtils } from 'three'
import { Pass } from 'three/examples/jsm/postprocessing/Pass.js'
import { HalftoneShader } from './HalftoneShader.js'
const FullScreenQuad = Pass.FullScreenQuad

/**
 * RGB Halftone pass for three.js effects composer. Requires HalftoneShader.
 */

class HalftonePass extends Pass {
	constructor(width, height, params) {
		super()

		if (HalftoneShader === undefined) {
			console.error('THREE.HalftonePass requires HalftoneShader')
		}

		this.uniforms = UniformsUtils.clone(HalftoneShader.uniforms)
		this.material = new ShaderMaterial({
			uniforms: this.uniforms,
			fragmentShader: HalftoneShader.fragmentShader,
			vertexShader: HalftoneShader.vertexShader,
		})

		// set params
		this.uniforms.width.value = width
		this.uniforms.height.value = height

		for (const key in params) {
			if (params.hasOwnProperty(key) && this.uniforms.hasOwnProperty(key)) {
				this.uniforms[key].value = params[key]
			}
		}

		this.fsQuad = new FullScreenQuad(this.material)
	}

	render(renderer, writeBuffer, readBuffer /*, deltaTime, maskActive*/) {
		this.material.uniforms['tDiffuse'].value = readBuffer.texture
		// renderer.setRenderTarget(this.textureComp)
		// this.fsQuad.render(renderer)
		if (this.renderToScreen) {
			renderer.setRenderTarget(null)
			this.fsQuad.render(renderer)
		} else {
			renderer.setRenderTarget(writeBuffer)
			if (this.clear) renderer.clear()
			this.fsQuad.render(renderer)
		}
	}

	setSize(width, height) {
		this.uniforms.width.value = width
		this.uniforms.height.value = height
	}
}

export { HalftonePass }
