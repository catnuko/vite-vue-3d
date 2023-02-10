/**
 * 参考：https://juejin.cn/post/7057793339164196900
 * brightness:[-1,1]，0为原图
 * contrast:[0,2]，1为原图
 * saturation:[0,2]，1为原图
 * opacity:[0,1]，1为原图
 */
const ColorShader = {
	uniforms: {
		brightness: { value: 0 },
		contrast: { value: 1 },
		saturation: { value: 1 },
		opacity: { value: 1 },
		tDiffuse: { value: null },
	},

	vertexShader: /* glsl */ `

		varying vec2 vUV;

		void main() {

			vUV = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);

		}`,

	fragmentShader: /* glsl */ `
		uniform sampler2D tDiffuse;
		uniform float brightness;
		uniform float contrast;
		uniform float saturation;
		uniform float opacity;
		varying vec2 vUV;

		const mediump vec3 luminanceWeighting = vec3(0.2125, 0.7154, 0.0721);
		void main() {
			vec4 textureColor = texture2D( tDiffuse, vUV );
			gl_FragColor = textureColor;
			// if(textureColor.r==0.0 && textureColor.g==0.0 && textureColor.b==0.0 ){
			// 	gl_FragColor = textureColor;
			// }else{
			// 	vec3 color = textureColor.rgb + vec3(brightness);
			// 	vec3 color1 = (color - vec3(0.5)) *  contrast + vec3(0.5);
			// 	vec3 color2 = vec3(dot(color1.rgb, luminanceWeighting));
			// 	gl_FragColor = vec4(mix(color2, color1.rgb, saturation), opacity);
			// }
		}`,
}

export { ColorShader }
