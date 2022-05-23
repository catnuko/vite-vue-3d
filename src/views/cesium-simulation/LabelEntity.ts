
import { addCartersian3Height, createScreenSpaceEventHandler, giveCartesian3Height } from "ht-cesium-utils";
import { getDefer } from "../../utils/url";
import { Popup } from "ht-popup/lib/index";
import LabelEditPopup from "./LabelEditPopup.vue";
import { app } from "../../main";

export class Editor {
	private _enable = false;
	private _handler: Cesium.ScreenSpaceEventHandler;
	private _plotInstance: IPlot;

	constructor(readonly viewer) {
		const { onclick, hanlder } = createScreenSpaceEventHandler(viewer);
		this._handler = hanlder;
		onclick((picked) => {
			if (!this._enable) return;
			if (picked?.id?._userData?.plotInfo?.plotInstance) {
				this._plotInstance = picked.id._userData.plotInfo.plotInstance;
				this._plotInstance.setEditable(true);
			} else if (picked?.id?._userData?.controlType) {
			} else {
				this._plotInstance?.setEditable(false);
			}
		});
	}

	setEnable(enable: boolean) {
		this._enable = enable;
	}

	destroy() {
		this._handler.destroy();
	}
}

export class Plot {
	private _plotInstance: IPlot;
	plotInstanceMap: Map<string, IPlot> = new Map();
	constructor(readonly viewer: Cesium.Viewer) {
		//移除左键双击跟踪,因为双击跟踪LabelPlot material时，文字大小展示有bug
		this.viewer.cesiumWidget.screenSpaceEventHandler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
	}
	active(type: string) {
		let plotInstance: IPlot;
		switch (type) {
			case "LabelPlot":
				plotInstance = new LabelPlot(this.viewer);
				break;
			case "LabelMaterialPlot":
				plotInstance = new LabelPlot(this.viewer, "material");
				break;
		}
		this._plotInstance = plotInstance;
		this._plotInstance
			.getControlPoints()
			.then((positions) => {
				const entity = this._plotInstance.makeGeometry(positions);
				this._plotInstance.setGeometrySymbol(entity);
				this.plotInstanceMap.set(this._plotInstance.id, this._plotInstance);
			})
			.catch((e) => {
				console.log("取消绘制");
			});
	}
	importToJson() {}

	deactive() {
		if (this._plotInstance) {
			this._plotInstance.deactive();
		}
	}
}

export interface IPlot {
	getControlPoints: () => Promise<Cesium.Cartesian3[]>;
	makeGeometry: (positions: Cesium.Cartesian3[]) => Cesium.Entity;
	setGeometrySymbol: (entity: Cesium.Entity) => void;
	destroy: () => void;
	setEditable(editable);
	deactive: () => void;
	exportToJson: () => object;
	importFromJson: (json: object) => void;
	id: string;
}
export interface LabelSymbol {
	text: string;
	color: string;
	fontSize: number;
}
export class LabelPlot implements IPlot {
	private _screenSpaceDestroy: Function;
	private _eleDestroy: Function;
	private _editable = false;
	private _entity?: Cesium.Entity;
	private _controlEntity: Cesium.Entity[] = [];
	removeControlPoints?: (entity: Cesium.Entity) => void;
	type: "material" | "label";
	id: string;
	constructor(readonly viewer: Cesium.Viewer, type: "material" | "label" = "label") {
		this.type = type;
		this.id = LabelPlot.getId();
	}
	private static _id = 0;
	static getId() {
		return `label_plot_${LabelPlot._id++}`;
	}
	exportToJson() {
		let drawInfo = this._entity._userData.drawInfo;
		let json = {
			position: this._entity.position.value,
			symbol: drawInfo.symbol,
			rotation: drawInfo.rotation,
		};
		return json;
	}
	importFromJson(json: { position: Cesium.Cartesian3; symbol: LabelSymbol; rotation: number }) {
		if (this._entity) {
			this.viewer.entities.remove(this._entity);
			this._entity = null;
		}
		this._entity = this.makeGeometry([json.position]);
		if (this.type === "material") {
			changeMaterialLabel(this._entity, json.symbol);
		} else {
			changeLabel(this._entity, json.symbol);
		}
	}
	setEditable(editable) {
		if (editable === this._editable) return;
		this._editable = editable;
		if (this._editable) {
			this.setGeometrySymbol(this._entity)?.then((res) => {
				this.setEditable(false);
			});
		} else {
			this.deactive();
		}
	}
	getControlPoints() {
		let defer = getDefer<Cesium.Cartesian3[]>();
		const { onclick, hanlder } = createScreenSpaceEventHandler(this.viewer);
		this._screenSpaceDestroy = () => {
			hanlder.destroy();
			defer.reject();
		};
		onclick((picked, lonlat, cartesian3) => {
			defer.resolve([cartesian3]);
			if (this._screenSpaceDestroy) {
				this._screenSpaceDestroy();
				this._screenSpaceDestroy = null;
			}
		});
		return defer.promise;
	}

	makeGeometry(positions: Cesium.Cartesian3[]) {
		const { viewer } = this;
		const newEntity = this.viewer.entities.add(
			new Cesium.Entity({
				position: positions[0],
			})
		);
		if (this.type === "material") {
			newEntity.plane = new Cesium.PlaneGraphics({
				plane: new Cesium.Plane(Cesium.Cartesian3.UNIT_Z, 0.0),
				dimensions: new Cesium.CallbackProperty(() => {
					if (!newEntity?._userData?.drawInfo) {
						return new Cesium.Cartesian2(1.0, 1.0);
					}
					const position = viewer.camera.position;
					const direction = viewer.camera.direction;
					const toCenter = Cesium.Cartesian3.subtract(newEntity.position._value, position, new Cesium.Cartesian3()); // vector from viewer.camera to a primitive
					const toCenterProj = Cesium.Cartesian3.multiplyByScalar(
						direction,
						Cesium.Cartesian3.dot(direction, toCenter),
						new Cesium.Cartesian3()
					);
					const distance = Cesium.Cartesian3.magnitude(toCenterProj);
					const pixelSize = viewer.camera.frustum.getPixelDimensions(
						viewer.scene.drawingBufferWidth,
						viewer.scene.drawingBufferHeight,
						distance,
						viewer.scene.pixelRatio,
						new Cesium.Cartesian2()
					);
					const { width, height } = newEntity._userData.drawInfo;
					let dimensionX = width * pixelSize.x;
					let dimensionY = height * pixelSize.y;
					return new Cesium.Cartesian2(dimensionX, dimensionY);
				}, false),
			});
		} else {
			newEntity.label = new Cesium.LabelGraphics({
				text: "",
				fillColor: Cesium.Color.WHITE,
				backgroundColor: Cesium.Color.BLACK,
				heightReference: Cesium.HeightReference.RELATIVE_TO_GROUND,
				disableDepthTestDistance: Number.POSITIVE_INFINITY,
				font: "25px sans-serif",
			});
		}
		newEntity._userData = {
			plotInfo: {
				plotInstance: this,
			},
		};
		this._entity = newEntity;

		return newEntity;
	}

	setGeometrySymbol(entity: Cesium.Entity) {
		const self = this;
		let defer = getDefer();
		let position = entity.position._value;
		if (position) {
			this._eleDestroy = () => {
				if (this.removeControlPoints) {
					this.removeControlPoints(entity);
					this.removeControlPoints = null;
				}
				newPopup.destroy();
				newPopup = null;
				document.querySelector("#popupContainer .popup").remove();
			};
			function onOver(symbol) {
				if (self._eleDestroy) {
					self._eleDestroy();
					self._eleDestroy = null;
				}
				defer.resolve();
			}
			function onSymbolChange(symbol) {
				changeLabel(entity, symbol);
			}
			function onSymbolChange2(symbol) {
				changeMaterialLabel(entity, symbol);
			}
			let fontSize = 0;
			try {
				fontSize = Number(entity.label.font._value.match(/\d+/g)[0]);
			} catch (error) {}
			let newPopup = new Popup({
				component: LabelEditPopup,
				vueAppContext: app._context,
				offset: [0, 20],
				props: {
					symbol:
						this.type === "label" || !this._entity._userData?.drawInfo?.symbol
							? {
									text: entity.label?.text?._value ?? "",
									color: entity.label?.fillColor?._value.toCssColorString() ?? "rgba(255,255,255,255)",
									fontSize: fontSize ? fontSize : 25,
							  }
							: this._entity._userData.drawInfo.symbol,
					onOver: onOver,
					onSymbolChange: this.type === "label" ? onSymbolChange : onSymbolChange2,
				},
				position: position,
				viewer: this.viewer,
			});
			this.addControlPoints(entity, newPopup);
		}
		return defer.promise;
	}
	addControlPoints(entity: Cesium.Entity, popup?: Popup) {
		if (this.type === "label") {
			entity.label.disableDepthTestDistance = 0;
		}
		let position = addCartersian3Height(entity.position._value, 2000);
		let panEntity = new Cesium.Entity({
			position: position,
			point: {
				pixelSize: 15,
				color: Cesium.Color.RED,
				heightReference: Cesium.HeightReference.RELATIVE_TO_GROUND,
				show: true,
			},
		});
		panEntity._userData = {
			controlType: "control-pan",
		};
		const panHandler = createScreenSpaceEventHandler(this.viewer);
		let moving = false;
		panHandler.onclick((picked, lonlat, cartesian3) => {
			if (picked?.id?._userData?.controlType === "control-pan" && !moving) {
				panHandler.hanlder.setInputAction((movement) => {
					let newPosition = this.viewer.scene.pickPosition(movement.endPosition);
					if (newPosition) {
						entity.position = newPosition;
						panEntity.position = newPosition;
						popup.position = newPosition;
						rotateEntity.position = newPosition
					}
					moving = true;
				}, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
			}
			if (picked?.id?._userData?.controlType === "control-rotate" && !moving) {
				panHandler.hanlder.setInputAction((movement) => {
					let originPosition = Cesium.SceneTransforms.wgs84ToWindowCoordinates(
						this.viewer.scene,
						entity.position._value
					);
					let difX = movement.endPosition.x - originPosition.x;
					let difY = originPosition.y - movement.endPosition.y;
					let rotation = angleByAtan(difX, difY);
					entity._userData.drawInfo.rotation = rotation;
					let rotationTransform = Cesium.Transforms.headingPitchRollQuaternion(
						entity.position._value,
						new Cesium.HeadingPitchRoll(rotation, 0.0, 0.0)
					);
					entity.orientation = rotationTransform;
					moving = true;
				}, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
			}
			if (moving) {
				panHandler.hanlder.removeInputAction(Cesium.ScreenSpaceEventType.MOUSE_MOVE);
				moving = false;
			}
		});
		const rotateEntity = new Cesium.Entity({
			position: position,
			billboard: {
				image: new URL("./旋转.png", import.meta.url).href,
				verticalOrigin: Cesium.VerticalOrigin.CENTER,
				horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
				pixelOffset: new Cesium.Cartesian2(0, -20),
				width: 25,
				height: 25,
			},
		});
		rotateEntity._userData = {
			controlType: "control-rotate",
		};

		this._controlEntity = [panEntity, rotateEntity];
		this._controlEntity.forEach((e) => {
			this.viewer.entities.add(e);
		});
		this.removeControlPoints = () => {
			this._controlEntity.forEach((e) => {
				this.viewer.entities.remove(e);
			});
			this._controlEntity.length = 0;
			panHandler.destroy();
			popup?.show();
			if (this.type === "label") {
				entity.label.disableDepthTestDistance = Number.POSITIVE_INFINITY;
			}
		};
	}
	deactive() {
		if (this._screenSpaceDestroy) {
			this._screenSpaceDestroy();
			this._screenSpaceDestroy = null;
		}
		if (this._eleDestroy) {
			this._eleDestroy();
			this._eleDestroy = null;
		}
	}
	destroy() {
		this.deactive();
		this._entity && this.viewer.entities.remove(this._entity);
	}
}
export function changeMaterialLabel(entity: Cesium.Entity, symbol) {
	if (!symbol.text) {
		symbol.text = " ";
	}
	const canvas = document.createElement("canvas");
	const ctx = canvas.getContext("2d");
	//设置canvas的宽高
	ctx.font = `${symbol.fontSize}px sans-serif`;
	const textMetrics = ctx.measureText(symbol.text);
	let width = textMetrics.width;
	let height = symbol.fontSize / 0.7619047619047619;
	canvas.width = width;
	canvas.height = height;
	//绘制文本
	ctx.font = `${symbol.fontSize}px sans-serif`;
	ctx.textAlign = "center";
	ctx.textBaseline = "middle";
	ctx.fillStyle = symbol.color;
	ctx.fillText(symbol.text, width / 2, height / 2);
	//显示平面
	let img = canvas.toDataURL();
	entity.position = giveCartesian3Height(entity.position._value, 2000);
	entity.plane.material = new Cesium.ImageMaterialProperty({
		image: img,
		transparent: true,
	});
	entity._userData.drawInfo = {
		width,
		height,
		symbol,
	};
}
export function changeLabel(entity: Cesium.Entity, symbol: LabelSymbol) {
	entity.label.text = symbol.text;
	entity.label.fillColor = Cesium.Color.fromCssColorString(symbol.color);
	entity.label.font = `${symbol.fontSize}px sans-serif`;
}
export function angleByAtan(difX: number, difY: number) {
	let rotation = Math.atan(difX / difY);
	//第二象限
	if (difX > 0 && difY < 0) {
		rotation = (Math.PI / 2) * 1 + Math.PI / 2 - Math.abs(rotation);
	} else if (difX < 0 && difY < 0) {
		//第三象限
		rotation = (Math.PI / 2) * 2 + Math.abs(rotation);
	} else if (difX < 0 && difY > 0) {
		//第四象限
		rotation = (Math.PI / 2) * 3 + Math.PI / 2 - Math.abs(rotation);
	}
	return rotation;
}
