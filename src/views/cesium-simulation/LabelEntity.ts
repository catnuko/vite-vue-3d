import Cesium from "dtcesium";
import { createScreenSpaceEventHandler, giveCartesian3Height, windowPosition2Cartesian3 } from "ht-cesium-utils";
import { getDefer } from "../../utils/url";
import { createVNode, handleError } from "vue";
import { poiIsRenderable } from "@here/harp-mapview";
import { Popup } from "ht-popup/lib/index";

export class Editor {
	private _enable = false;
	private _handler: Cesium.ScreenSpaceEventHandler;
	private _plotInstance: IPlot;

	constructor(readonly viewer) {
		const { onclick, hanlder } = createScreenSpaceEventHandler(viewer);
		this._handler = hanlder;
		onclick((picked) => {
			if (!this._enable) return;
			console.log(picked);
			if (picked?.id?._userData?.plotInfo?.plotInstance) {
				this._plotInstance = picked.id._userData.plotInfo.plotInstance;
				this._plotInstance.setEditable(true);
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
			.drawGeometry()
			.then((entity) => {
				this._plotInstance.setGeometrySymbol(entity);
			})
			.catch((e) => {
				console.log("取消绘制");
			});
	}

	deactive() {
		if (this._plotInstance) {
			this._plotInstance.destroy();
		}
	}
}

export interface IPlot {
	drawGeometry: () => Promise<Cesium.Entity>;
	setGeometrySymbol: (entity: Cesium.Entity) => void;
	destroy: () => void;
	makeGeometry: (position: Cesium.Cartesian3 | Cesium.Cartesian3[]) => Cesium.Entity;

	setEditable(editable);
}

export class LabelPlot implements IPlot {
	private _screenSpaceDestroy: Function;
	private _eleDestroy: Function;
	private _editable = false;
	private _entity?: Cesium.Entity;

	constructor(readonly viewer: Cesium.Viewer) {}

	setEditable(editable) {
		if (editable === this._editable) return;
		this._editable = editable;
		if (this._editable) {
			this.setGeometrySymbol(this._entity)?.then((res) => {
				this.setEditable(false);
			});
		} else {
			this.destroy();
		}
	}

	makeGeometry(position) {
		const newEntity = this.viewer.entities.add(
			new Cesium.Entity({
				position: position,
				point: {
					pixelSize: 5,
					color: Cesium.Color.RED,
					heightReference: Cesium.HeightReference.RELATIVE_TO_GROUND,
				},
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

	drawGeometry() {
		let defer = getDefer<Cesium.Entity>();
		const { onclick, hanlder } = createScreenSpaceEventHandler(this.viewer);
		this._screenSpaceDestroy = () => {
			hanlder.destroy();
			defer.reject();
		};
		onclick((picked, lonlat, cartesian3) => {
			const newEntity = this.makeGeometry(giveCartesian3Height(cartesian3, lonlat.height + 20000));
			defer.resolve(newEntity);
			if (this._screenSpaceDestroy) {
				this._screenSpaceDestroy();
				this._screenSpaceDestroy = null;
			}
		});
		return defer.promise;
	}

	setGeometrySymbol(entity: Cesium.Entity) {
		const self = this;
		let defer = getDefer();
		let position = entity.position._value;
		if (position) {
			this._eleDestroy = () => {
				entity.point = null;
				newPopup.destroy();
				newPopup = null;
				document.querySelector("#popupContainer .popup").remove();
			};

			function onKeyUp(evt) {
				if (evt.keyCode == "13") {
					if (self._eleDestroy) {
						self._eleDestroy();
						self._eleDestroy = null;
					}
					defer.resolve();
				}
			}

			function onInput(evt) {
				if (evt.target) {
					if (!entity.label) {
						entity.label = new Cesium.LabelGraphics({
							text: "",
							fillColor: Cesium.Color.WHITE,
							backgroundColor: Cesium.Color.BLACK,
							heightReference: Cesium.HeightReference.RELATIVE_TO_GROUND,
							disableDepthTestDistance: Number.POSITIVE_INFINITY,
						});
					}
					entity.label.text = evt.target.value;
				}
			}

			let newPopup = new Popup({
				component: {
					render(_ctx, _cache, $props, $setup, $data, $options) {
						return createVNode("input", {
							class: "popup",
							type: "text",
							placeholder: "...",
							value: entity.label?.text?._value ?? "",
							onKeyup: onKeyUp,
							onInput: onInput,
						});
					},
				},
				props: {},
				position: position,
				viewer: this.viewer,
			});
		}
		return defer.promise;
	}

	destroy() {
		if (this._screenSpaceDestroy) {
			this._screenSpaceDestroy();
			this._screenSpaceDestroy = null;
		}
		if (this._eleDestroy) {
			this._eleDestroy();
			this._eleDestroy = null;
		}
	}
}
