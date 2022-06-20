import Vert from "./vert.wgsl";
import Frag from "./frag.wgsl";
import Shadow from "./shadow.wgsl";
import { mesh } from "./chineseDragon";
import { mat4, vec3, vec4 } from "gl-matrix";
const shadowDepthTextureSize = 1024;
export default class Show {
	constructor(id) {
		this.id = id;
		this.init();
	}
	async init() {
		const canvasRef = {
			current: document.getElementById(this.id),
		};
		const adapter = await navigator.gpu.requestAdapter();
		const device = await adapter.requestDevice();

		if (canvasRef.current === null) return;
		const context = canvasRef.current.getContext("webgpu");

		const devicePixelRatio = window.devicePixelRatio || 1;
		const presentationSize = [
			canvasRef.current.clientWidth * devicePixelRatio,
			canvasRef.current.clientHeight * devicePixelRatio,
		];
		const aspect = presentationSize[0] / presentationSize[1];
		const presentationFormat = context.getPreferredFormat(adapter);
		context.configure({
			device,
			format: presentationFormat,
			size: presentationSize,
		});
		const kVertexStride = 6;

		//创建VBO
		let vertexBuffer = device.createBuffer({
			size: mesh.positions.length * kVertexStride * Float32Array.BYTES_PER_ELEMENT,
			usage: GPUBufferUsage.VERTEX,
			mappedAtCreation: true,
		});
		let mapping = new Float32Array(vertexBuffer.getMappedRange());
		for (let i = 0; i < mesh.positions.length; i++) {
			mapping.set(mesh.positions[i], kVertexStride * i);
			mapping.set(mesh.normals[i], kVertexStride * i + 3);
		}
		vertexBuffer.unmap();
		const indexBuffer = device.createBuffer({
			size: mesh.triangles.length * 3 * Uint16Array.BYTES_PER_ELEMENT,
			usage: GPUBufferUsage.INDEX,
			mappedAtCreation: true,
		});
		let mapping2 = new Uint16Array(indexBuffer.getMappedRange());
		for (let i = 0; i < mesh.triangles.length; i++) {
			mapping2.set(mesh.triangles[i], 3 * i);
		}
		indexBuffer.unmap();

		const modelUniformBuffer = device.createBuffer({
			size: 16 * 4,
			usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
		});

		const sceneUniformBuffer = device.createBuffer({
			size: 2 * 4 * 16 + 3 * 4,
			usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
		});

		const shadowDepthTexture = device.createTexture({
			size: [shadowDepthTextureSize, shadowDepthTextureSize, 1],
			usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.TEXTURE_BINDING,
			format: "depth32float",
		});

		const depthTexture = device.createTexture({
			size: presentationSize,
			format: "depth24plus-stencil8",
			usage: GPUTextureUsage.RENDER_ATTACHMENT,
		});

		const uniformBufferBindGroupLayout = device.createBindGroupLayout({
			entries: [
				{
					binding: 0,
					visibility: GPUShaderStage.VERTEX,
					buffer: {
						type: "uniform",
					},
				},
			],
		});
		const bglForRender = device.createBindGroupLayout({
			entries: [
				{
					binding: 0,
					visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT,
					buffer: {
						type: "uniform",
					},
				},
				{
					binding: 1,
					visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT,
					texture: {
						sampleType: "depth",
					},
				},
				{
					binding: 2,
					visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT,
					sampler: {
						type: "comparison",
					},
				},
			],
		});
		const sceneBindGroupForShadow = device.createBindGroup({
			layout: uniformBufferBindGroupLayout,
			entries: [
				{
					binding: 0,
					resource: {
						buffer: sceneUniformBuffer,
					},
				},
			],
		});

		const sceneBindGroupForRender = device.createBindGroup({
			layout: bglForRender,
			entries: [
				{
					binding: 0,
					resource: {
						buffer: sceneUniformBuffer,
					},
				},
				{
					binding: 1,
					resource: shadowDepthTexture.createView(),
				},
				{
					binding: 2,
					resource: device.createSampler({
						compare: "less",
					}),
				},
			],
		});

		const modelBindGroup = device.createBindGroup({
			layout: uniformBufferBindGroupLayout,
			entries: [
				{
					binding: 0,
					resource: {
						buffer: modelUniformBuffer,
					},
				},
			],
		});

		let renderPassDescriptor = {
			colorAttachments: [
				{
					view: undefined,
					clearValue: { r: 0.5, g: 0.5, b: 0.5, a: 1 },
					loadOp: "clear",
					storeOp: "store",
				},
			],
			depthStencilAttachment: {
				view: depthTexture.createView(),
				depthClearValue: 1.0,
				depthLoadOp: "clear",
				depthStoreOp: "store",
				stencilClearValue: 0,
				stencilLoadOp: "clear",
				stencilStoreOp: "store",
			},
		};
		const vertexBuffers = [
			{
				arrayStride: Float32Array.BYTES_PER_ELEMENT * kVertexStride,
				attributes: [
					{
						shaderLocation: 0,
						format: "float32x3",
						offset: 0,
					},
					{
						shaderLocation: 1,
						format: "float32x3",
						offset: 3 * Float32Array.BYTES_PER_ELEMENT,
					},
				],
			},
		];
		let pipeline = device.createRenderPipeline({
			layout: device.createPipelineLayout({
				bindGroupLayouts: [bglForRender, uniformBufferBindGroupLayout],
			}),
			vertex: {
				module: device.createShaderModule({
					code: Vert,
				}),
				entryPoint: "main",
				buffers: vertexBuffers,
			},
			fragment: {
				module: device.createShaderModule({
					code: Frag,
				}),
				entryPoint: "main",
				targets: [
					{
						format: presentationFormat,
					},
				],
			},
			depthStencil: {
				depthWriteEnabled: true,
				depthCompare: "less",
				format: "depth24plus-stencil8",
			},
			primitive: {
				topology: "triangle-list",
				cullMode: "back",
			},
		});

		let shadowPipeline = device.createRenderPipeline({
			layout: device.createPipelineLayout({
				bindGroupLayouts: [uniformBufferBindGroupLayout, uniformBufferBindGroupLayout],
			}),
			vertex: {
				module: device.createShaderModule({
					code: Shadow,
				}),
				entryPoint: "main",
				buffers: vertexBuffers,
			},
			depthStencil: {
				depthWriteEnabled: true,
				depthCompare: "less",
				format: "depth32float",
			},
			primitive: {
				topology: "triangle-list",
				cullMode: "back",
			},
		});
		const eyePosition = vec3.fromValues(0, 50, -100);
		const upVector = vec3.fromValues(0, 1, 0);
		const origin = vec3.fromValues(0, 0, 0);
		const projectionMatrix = mat4.create();
		mat4.perspective(projectionMatrix, (2 * Math.PI) / 5, aspect, 1, 2000);

		const viewMatrix = mat4.create();
		mat4.lookAt(viewMatrix, eyePosition, origin, upVector);

		const lightPosition = vec3.fromValues(50, 100, -100);
		const lightViewMatrix = mat4.create();
		mat4.lookAt(lightViewMatrix, lightPosition, origin, upVector);

		const lightProjectionMatrix = mat4.create();
		mat4.ortho(lightProjectionMatrix, -80, 80, -80, 80, -200, 300);

		const lightViewProjMatrix = mat4.create();
		mat4.lookAt(lightViewMatrix, lightPosition, origin, upVector);
		mat4.multiply(lightViewProjMatrix, lightProjectionMatrix, lightViewMatrix);

		const viewProjMatrix = mat4.create();
		mat4.multiply(viewProjMatrix, viewMatrix, projectionMatrix);

		const modelMatrix = mat4.create();
		mat4.translate(modelMatrix, modelMatrix, vec3.fromValues(0, -5, 0));
		mat4.translate(modelMatrix, modelMatrix, vec3.fromValues(0, -40, 0));

		device.queue.writeBuffer(
			sceneUniformBuffer,
			0,
			lightViewProjMatrix.buffer,
			lightViewProjMatrix.byteOffset,
			lightViewProjMatrix.byteLength
		);

		device.queue.writeBuffer(
			sceneUniformBuffer,
			16 * 4 * 2,
			lightPosition.buffer,
			lightPosition.byteOffset,
			lightPosition.byteLength
		);
		device.queue.writeBuffer(modelUniformBuffer, 0, modelMatrix.buffer, modelMatrix.byteOffset, modelMatrix.byteLength);

		function getCameraViewProjMatrix() {
			const eyePosition = vec3.fromValues(0, 50, -100);

			const rad = Math.PI * (Date.now() / 2000);
			vec3.rotateY(eyePosition, eyePosition, origin, rad);
		
			const viewMatrix = mat4.create();
			mat4.lookAt(viewMatrix, eyePosition, origin, upVector);
		
			mat4.multiply(viewProjMatrix, projectionMatrix, viewMatrix);
			return viewProjMatrix
		}
		function frame() {
			getCameraViewProjMatrix();
			device.queue.writeBuffer(
				sceneUniformBuffer,
				16 * 4,
				viewProjMatrix.buffer,
				viewProjMatrix.byteOffset,
				viewProjMatrix.byteLength
			);
			renderPassDescriptor.colorAttachments[0].view = context.getCurrentTexture().createView();

			let commandEncoder = device.createCommandEncoder();
			let shadowRenderPass = commandEncoder.beginRenderPass({
				colorAttachments: [],
				depthStencilAttachment: {
					view: shadowDepthTexture.createView(),
					depthClearValue: 1,
					depthLoadOp: "clear",
					depthStoreOp: "store",
				},
			});
			shadowRenderPass.setPipeline(shadowPipeline);
			shadowRenderPass.setBindGroup(0, sceneBindGroupForShadow);
			shadowRenderPass.setBindGroup(1, modelBindGroup);
			shadowRenderPass.setVertexBuffer(0, vertexBuffer);
			shadowRenderPass.setIndexBuffer(indexBuffer, "uint16");
			shadowRenderPass.drawIndexed(mesh.triangles.length * 3);
			shadowRenderPass.end();

			let renderPass = commandEncoder.beginRenderPass(renderPassDescriptor);
			renderPass.setPipeline(pipeline);
			renderPass.setBindGroup(0, sceneBindGroupForRender);
			renderPass.setBindGroup(1, modelBindGroup);
			renderPass.setVertexBuffer(0, vertexBuffer);
			renderPass.setIndexBuffer(indexBuffer, "uint16");
			renderPass.drawIndexed(mesh.triangles.length * 3);
			renderPass.end();
			device.queue.submit([commandEncoder.finish()]);
			requestAnimationFrame(frame);
		}
		this.hanlder = requestAnimationFrame(frame);
	}
	destroy() {
		if (this.hanlder) {
			cancelAnimationFrame(this.hanlder);
			this.hanlder = null;
		}
	}
}
