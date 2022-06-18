import triangleVertWGSL from "./vert.wgsl";
import redFragWGSL from "./frag.wgsl";
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

		const pipeline = device.createRenderPipeline({
			vertex: {
				module: device.createShaderModule({
					code: triangleVertWGSL,
				}),
				entryPoint: "main",
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
			},
		});

		function frame() {
			// Sample is no longer the active page.
			if (!canvasRef.current) return;

			const commandEncoder = device.createCommandEncoder();
			const textureView = context.getCurrentTexture().createView();

			const renderPassDescriptor = {
				colorAttachments: [
					{
						view: textureView,
						clearValue: { r: 0.0, g: 0.0, b: 0.0, a: 1.0 },
						loadOp: "clear",
						storeOp: "store",
					},
				],
			};

			const passEncoder = commandEncoder.beginRenderPass(renderPassDescriptor);
			passEncoder.setPipeline(pipeline);
			passEncoder.draw(3, 1, 0, 0);
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
