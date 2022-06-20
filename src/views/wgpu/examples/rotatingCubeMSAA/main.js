import triangleVertWGSL from "./vert.wgsl";
import redFragWGSL from "./frag.wgsl";
import {
	cubeColorOffset,
	cubePositionOffset,
	cubeUVOffset,
	cubeVertexCount,
	cubeVertexSize,
	cubeVertexArray,
} from "./cube";
import { mat3, mat4, vec3, vec2 } from "gl-matrix";
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
		const presentationFormat = context.getPreferredFormat(adapter);

		context.configure({
			device,
			format: presentationFormat,
			size: presentationSize,
		});

		// Create a vertex buffer from the cube data.
		const verticesBuffer = device.createBuffer({
			size: cubeVertexArray.byteLength,
			usage: GPUBufferUsage.VERTEX,
			mappedAtCreation: true,
		});
		new Float32Array(verticesBuffer.getMappedRange()).set(cubeVertexArray);
		verticesBuffer.unmap();
		const sampleCount = 4;

		const pipeline = device.createRenderPipeline({
			vertex: {
				module: device.createShaderModule({
					code: triangleVertWGSL,
				}),
				entryPoint: "main",
				buffers: [
					{
						arrayStride: cubeVertexSize,
						attributes: [
							{
								// position
								shaderLocation: 0,
								offset: cubePositionOffset,
								format: "float32x4",
							},
							{
								// uv
								shaderLocation: 1,
								offset: cubeUVOffset,
								format: "float32x2",
							},
						],
					},
				],
			},
			fragment: {
				module: device.createShaderModule({
					code: redFragWGSL,
				}),
				entryPoint: "main",
				targets: [
					{
						format: presentationFormat,
					},
				],
			},
			primitive: {
				topology: "triangle-list",

				// Backface culling since the cube is solid piece of geometry.
				// Faces pointing away from the camera will be occluded by faces
				// pointing toward the camera.
				cullMode: "back",
			},

			// Enable depth testing so that the fragment closest to the camera
			// is rendered in front.
			depthStencil: {
				depthWriteEnabled: true,
				depthCompare: "less",
				format: "depth24plus",
			},
			multisample: {
				count: sampleCount,
			},
		});

		const depthTexture = device.createTexture({
			size: presentationSize,
			format: "depth24plus",
			usage: GPUTextureUsage.RENDER_ATTACHMENT,
			sampleCount,
		});

		const uniformBufferSize = 4 * 16; // 4x4 matrix
		const uniformBuffer = device.createBuffer({
			size: uniformBufferSize,
			usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
		});

		const uniformBindGroup = device.createBindGroup({
			layout: pipeline.getBindGroupLayout(0),
			entries: [
				{
					binding: 0,
					resource: {
						buffer: uniformBuffer,
					},
				},
			],
		});
		const texture = device.createTexture({
			size: presentationSize,
			format: presentationFormat,
			sampleCount,
			usage: GPUTextureUsage.RENDER_ATTACHMENT,
		});
		const renderPassDescriptor = {
			colorAttachments: [
				{
					//   view: undefined, // Assigned later
					view: texture.createView(),
					resolveTarget: null,
					clearValue: { r: 0.5, g: 0.5, b: 0.5, a: 1.0 },
					loadOp: "clear",
					storeOp: "store",
				},
			],
			depthStencilAttachment: {
				view: depthTexture.createView(),

				depthClearValue: 1.0,
				depthLoadOp: "clear",
				depthStoreOp: "store",
			},
		};

		const aspect = canvasRef.current.width / canvasRef.current.height;
		const projectionMatrix = mat4.create();
		mat4.perspective(projectionMatrix, (2 * Math.PI) / 5, aspect, 1, 100.0);

		function getTransformationMatrix() {
			const viewMatrix = mat4.create();
			mat4.translate(viewMatrix, viewMatrix, vec3.fromValues(0, 0, -4));
			const now = Date.now() / 1000;
			mat4.rotate(viewMatrix, viewMatrix, 1, vec3.fromValues(Math.sin(now), Math.cos(now), 0));

			const modelViewProjectionMatrix = mat4.create();
			mat4.multiply(modelViewProjectionMatrix, projectionMatrix, viewMatrix);

			return modelViewProjectionMatrix;
		}

		function frame() {
			// Sample is no longer the active page.
			if (!canvasRef.current) return;

			const transformationMatrix = getTransformationMatrix();
			device.queue.writeBuffer(
				uniformBuffer,
				0,
				transformationMatrix.buffer,
				transformationMatrix.byteOffset,
				transformationMatrix.byteLength
			);
			renderPassDescriptor.colorAttachments[0].resolveTarget = context.getCurrentTexture().createView();

			const commandEncoder = device.createCommandEncoder();
			const passEncoder = commandEncoder.beginRenderPass(renderPassDescriptor);
			passEncoder.setPipeline(pipeline);
			passEncoder.setBindGroup(0, uniformBindGroup);
			passEncoder.setVertexBuffer(0, verticesBuffer);
			passEncoder.draw(cubeVertexCount, 1, 0, 0);
			passEncoder.end();
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
