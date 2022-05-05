import Cesium from "dtcesium";
import { addCartersian3Height, createScreenSpaceEventHandler } from "ht-cesium-utils";
import { getDefer } from "../../utils/url";
import { createVNode, handleError } from "vue";
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

	constructor(readonly viewer: Cesium.Viewer) {}

	active(type: string) {
		let plotInstance: IPlot;
		switch (type) {
			case "LabelPlot":
				plotInstance = new LabelPlot(this.viewer);
				break;
		}
		this._plotInstance = plotInstance;
		this._plotInstance
			.getControlPoints()
			.then((positions) => {
				const entity = this._plotInstance.makeGeometry(positions);
				this._plotInstance.setGeometrySymbol(entity);
			})
			.catch((e) => {
				console.log("取消绘制");
			});
	}

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
}

export class LabelPlot implements IPlot {
	private _screenSpaceDestroy: Function;
	private _eleDestroy: Function;
	private _editable = false;
	private _entity?: Cesium.Entity;
	private _controlEntity: Cesium.Entity[] = [];
	removeControlPoints?: (entity: Cesium.Entity) => void;
	constructor(readonly viewer: Cesium.Viewer) {}

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
		const newEntity = this.viewer.entities.add(
			new Cesium.Entity({
				position: positions[0],
			})
		);
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
				if (!entity.label) {
					entity.label = new Cesium.LabelGraphics({
						text: "",
						fillColor: Cesium.Color.WHITE,
						backgroundColor: Cesium.Color.BLACK,
						heightReference: Cesium.HeightReference.RELATIVE_TO_GROUND,
						disableDepthTestDistance: Number.POSITIVE_INFINITY,
						font: "25px sans-serif",
					});
				}
				entity.label.text = symbol.text;
				entity.label.fillColor = Cesium.Color.fromCssColorString(symbol.color);
				entity.label.font = `${symbol.fontSize}px sans-serif`;
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
					symbol: {
						text: entity.label?.text?._value ?? "",
						color: entity.label?.fillColor?._value.toCssColorString() ?? "rgba(255,255,255,255)",
						fontSize: fontSize ? fontSize : 25,
					},
					onOver: onOver,
					onSymbolChange: onSymbolChange,
				},
				position: position,
				viewer: this.viewer,
			});
			this.addControlPoints(entity, newPopup);
		}
		return defer.promise;
	}
	addControlPoints(entity: Cesium.Entity, popup?: Popup) {
		entity.label.disableDepthTestDistance = 0;
		let panEntity = new Cesium.Entity({
			position: addCartersian3Height(entity.position._value, 2000),
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
					popup?.hide();
					let newPosition = this.viewer.scene.pickPosition(movement.endPosition);
					if (newPosition) {
						entity.position = newPosition;
						panEntity.position = newPosition;
						popup.position = newPosition;
						moving = true;
					}
				}, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
			}
			if (moving) {
				panHandler.hanlder.removeInputAction(Cesium.ScreenSpaceEventType.MOUSE_MOVE);
				moving = false;
				popup?.show();
			}
		});
		this._controlEntity = [panEntity];
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
			entity.label.disableDepthTestDistance = Number.POSITIVE_INFINITY;
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
