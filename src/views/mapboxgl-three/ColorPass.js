import { ShaderMaterial, UniformsUtils } from 'three'
import { Pass } from 'three/examples/jsm/postprocessing/Pass.js'
import { ColorShader } from './ColorShader.js'
const FullScreenQuad = Pass.FullScreenQuad

/**
 * RGB Halftone pass for three.js effects composer. Requires ColorShader.
 */

class ColorPass extends Pass {
	constructor(params) {
		super()
		this.params = params
		if (ColorShader === undefined) {
			console.error('THREE.ColorPass requires ColorShader')
		}

		this.uniforms = UniformsUtils.clone(ColorShader.uniforms)
		this.material = new ShaderMaterial({
			uniforms: this.uniforms,
			fragmentShader: ColorShader.fragmentShader,
			vertexShader: ColorShader.vertexShader,
		})

		this.fsQuad = new FullScreenQuad(this.material)
	}

	render(renderer, writeBuffer, readBuffer /*, deltaTime, maskActive*/) {
		this.material.uniforms['tDiffuse'].value = readBuffer.texture
		for (const key in this.params) {
			if (this.params.hasOwnProperty(key) && this.uniforms.hasOwnProperty(key)) {
				this.uniforms[key].value = this.params[key]
			}
		}
		if (this.renderToScreen) {
			renderer.setRenderTarget(null)
			this.fsQuad.render(renderer)
		} else {
			renderer.setRenderTarget(writeBuffer)
			if (this.clear) renderer.clear()
			this.fsQuad.render(renderer)
		}
	}
}

export { ColorPass }
