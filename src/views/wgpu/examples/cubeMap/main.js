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
		});

		const depthTexture = device.createTexture({
			size: presentationSize,
			format: "depth24plus",
			usage: GPUTextureUsage.RENDER_ATTACHMENT,
		});

		const uniformBufferSize = 4 * 16; // 4x4 matrix
		const uniformBuffer = device.createBuffer({
			size: uniformBufferSize,
			usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
		});
		let imgs = [
			new URL("./img/1.png", import.meta.url).href,
			new URL("./img/2.png", import.meta.url).href,
			new URL("./img/3.png", import.meta.url).href,
			new URL("./img/4.png", import.meta.url).href,
			new URL("./img/5.png", import.meta.url).href,
			new URL("./img/6.png", import.meta.url).href,
		];
		let promises = imgs.map(async (i) => {
			const src = "./resources/boy.png";
			const img = document.createElement("img");
			img.src = src;
			await img.decode();
			const imageBitmap = await createImageBitmap(img);
			return imageBitmap;
		});
		const imageBitmaps = await Promise.all(promises);
		const cubeTexture = device.createTexture({
			dimension: "2d",
			size: [imageBitmaps[0].width, imageBitmaps[0].height, imgs.length],
			format: "rgba8unorm",
			usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST | GPUTextureUsage.RENDER_ATTACHMENT,
		});
		imageBitmaps.forEach((imageBitmap, i) => {
			device.queue.copyExternalImageToTexture({ source: imageBitmap }, { texture: cubeTexture, origin: [0, 0, i] }, [
				imageBitmap.width,
				imageBitmap.height,
			]);
		});

		const sampler = device.createSampler({
			magFilter: "linear",
			minFilter: "linear",
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
				{
					binding: 1,
					resource: sampler,
				},
				{
					binding: 2,
					resource: cubeTexture.createView({ dimension: "cube" }),
				},
			],
		});

		const renderPassDescriptor = {
			colorAttachments: [
				{
					view: undefined, // Assigned later

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
		mat4.perspective(projectionMatrix, (2 * Math.PI) / 5, aspect, 1, 3000.0);
		const modelMatrix = mat4.create();
		mat4.scale(modelMatrix, modelMatrix, vec3.fromValues(1000.0, 1000.0, 1000.0));
		const modelViewProjectionMatrix = mat4.create();
		const viewMatrix = mat4.create();
		const tmpMatrix = mat4.create();
		function getTransformationMatrix() {
			const now = Date.now() / 800;
			mat4.rotate(tmpMatrix, viewMatrix, (Math.PI / 10) * Math.sin(now), vec3.fromValues(1, 0, 0));
			mat4.rotate(tmpMatrix, tmpMatrix, now * 0.2, vec3.fromValues(0, 1, 0));
			mat4.multiply(modelViewProjectionMatrix, tmpMatrix, modelMatrix);
			mat4.multiply(modelViewProjectionMatrix, projectionMatrix, modelViewProjectionMatrix);
		}

		function frame() {
			// Sample is no longer the active page.
			if (!canvasRef.current) return;

			getTransformationMatrix();
			device.queue.writeBuffer(
				uniformBuffer,
				0,
				modelViewProjectionMatrix.buffer,
				modelViewProjectionMatrix.byteOffset,
				modelViewProjectionMatrix.byteLength
			);
			renderPassDescriptor.colorAttachments[0].view = context.getCurrentTexture().createView();

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
