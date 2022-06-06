import { dayjs } from "./dayjs";
import { c, _c, getValueOfGraphic } from "./utils";
//https://github.com/AnalyticalGraphicsInc/czml-writer/wiki/Packet
export class Packet {
	packet;
	constructor(packet) {
		if (packet) {
			this.packet = packet;
		} else {
			this.packet = {};
		}
	}
	id(v) {
		if (v) {
			this.packet.id = v;
			return this;
		} else {
			return this.packet.id;
		}
	}
	name(v) {
		if (v) {
			this.packet.name = v;
			return this;
		} else {
			return this.packet.name;
		}
	}
	delete(v) {
		if (v) {
			this.packet.delete = v;
			return this;
		} else {
			return this.packet.delete;
		}
	}
	parent(v) {
		if (v) {
			this.packet.parent = v;
			return this;
		} else {
			return this.packet.parent;
		}
	}
	version(v) {
		if (v) {
			this.packet.version = v;
			return this;
		} else {
			return this.packet.version;
		}
	}
	description(options) {
		if (!options) {
			return this.packet.description;
		} else {
			const { str, reference } = options;
			this.packet.description = {
				string: str,
				reference: `${reference.id()}#description`,
			};
			return this;
		}
	}
	availability(options) {
		if (!options) {
			if (this.packet.availability) {
				let res = this.packet.availability.split("/");
				let start = dayjs(res[0]);
				let end = dayjs(res[1]);
				return timeRange({ start, end });
			}
		} else {
			let _tr = timeRange(options);
			this.packet.availability = timeRangeToISOString(_tr);
			return this;
		}
	}
	//cartesian3
	viewFrom(options) {
		if (!options) {
		} else {
			this.packet.viewFrom = c({ propertyName: "cartesian", value: options });
		}
	}
	position(options) {
		if (!options) {
			let startTime,
				endTime,
				positions = [];
			let ps = this.packet.position.cartesian;
			if (ps.length % 3 === 0) {
				return new Cesium.Cartesian3(this.packet.position[0], this.packet.position[1], this.packet.position[2]);
			} else {
				if (this.packet.position.epoch) {
					startTime = dayjs(this.packet.position.epoch);
					let durationSeconds = ps[ps.length - 4];
					let duration = dayjs.duration(durationSeconds, "s");
					endTime = startTime.add(duration);
				} else {
					startTime = dayjs(ps[0]);
					endTime = dayjs(ps[ps.length - 4]);
				}
				for (let i = 0; i < ps.length; i = i + 4) {
					positions.push(new Cesium.Cartesian3(i + 1, i + 2, i + 3));
				}
				return { startTime, endTime, positions };
			}
		} else {
			const { startTime, endTime, positions } = options;
			if (!startTime && !endTime) {
				this.packet.position = c({ propertyName: "cartesian", value: positions[0] });
			} else {
				this.packet.position = c({ propertyName: "cartesian", value: positions, startTime, endTime });
			}
			return this;
		}
	}
	point(options) {
		if (!options) {
		} else {
			let obj = {};
			getValueOfGraphic(options, "show", "boolean", obj);
			getValueOfGraphic(options, "color", "rgba", obj);
			getValueOfGraphic(options, "outlineColor", "rgba", obj);
			getValueOfGraphic(options, "outlineWidth", "number", obj);
			getValueOfGraphic(options, "disableDepthTestDistance", "number", obj);
			getValueOfGraphic(options, "distanceDisplayCondition", "distanceDisplayCondition", obj);
			getValueOfGraphic(options, "pixelSize", "number", obj);
			getValueOfGraphic(options, "scaleByDistance", "nearFarScalar", obj);
			getValueOfGraphic(options, "translucencyByDistance", "nearFarScalar", obj);
			this.packet.point = obj;
			return this;
		}
	}
	polyline(options) {
		if (!options) {
		} else {
			let obj = {};
			getValueOfGraphic(options, "show", "boolean", obj);
			getValueOfGraphic(options, "positions", "cartesian", obj);
			getValueOfGraphic(options, "arcType", "arcType", obj);
			getValueOfGraphic(options, "width", "number", obj);
			getValueOfGraphic(options, "granularity", "number", obj);
			if (options.material) obj.material = _c({ type: "material", value: options.material }).value;
			getValueOfGraphic(options, "followSurface", "boolean", obj);
			getValueOfGraphic(options, "shadowMode", "shadowMode", obj);
			if (options.depthFailMaterial)
				obj.depthFailMaterial = _c({ type: "material", value: options.depthFailMaterial }).value;
			getValueOfGraphic(options, "distanceDisplayCondition", "distanceDisplayCondition", obj);
			getValueOfGraphic(options, "clampToGround", "boolean", obj);
			getValueOfGraphic(options, "classificationType", "classificationType", obj);
			getValueOfGraphic(options, "zIndex", "number", obj);
			this.packet.polyline = obj;
			return this;
		}
	}
	polygon(options) {
		if (!options) {
		} else {
			let obj = {};
			getValueOfGraphic(options, "show", "boolean", obj);
			getValueOfGraphic(options.hierarchy, "cartesianpositions", "hierarchy", obj);
			if (options.hierarchy) {
				const hierarchy = options.hierarchy.getValue();
				obj.positions = c({ propertyName: "cartesian", value: hierarchy.positions });
				obj.holes = {
					cartesian: [],
				};
				hierarchy.holes.forEach((_hierarchy) => {
					let res = c({ propertyName: "cartesian", value: _hierarchy.positions });
					obj.holes.cartesian.push(res.cartesian);
				});
			}
			getValueOfGraphic(options.hierarchy, "cartesianholes", "hierarchy", obj);
			getValueOfGraphic(options, "arcType", "arcType", obj);
			getValueOfGraphic(options, "height", "number", obj);
			getValueOfGraphic(options, "heightReference", "heightReference", obj);
			getValueOfGraphic(options, "extrudedHeight", "number", obj);
			getValueOfGraphic(options, "extrudedHeightReference", "heightReference", obj);
			getValueOfGraphic(options, "stRotation", "number", obj);
			getValueOfGraphic(options, "granularity", "number", obj);
			getValueOfGraphic(options, "fill", "boolean", obj);
			if (options.material) obj.material = _c({ type: "material", value: options.material }).value;
			getValueOfGraphic(options, "outline", "boolean", obj);
			getValueOfGraphic(options, "outlineColor", "rgba", obj);
			getValueOfGraphic(options, "outlineWidth", "number", obj);
			getValueOfGraphic(options, "perPositionHeight", "boolean", obj);
			getValueOfGraphic(options, "closeTop", "boolean", obj);
			getValueOfGraphic(options, "closeBottom", "boolean", obj);
			getValueOfGraphic(options, "shadows", "shadowMode", obj);
			getValueOfGraphic(options, "distanceDisplayCondition", "distanceDisplayCondition", obj);
			getValueOfGraphic(options, "classificationType", "classificationType", obj);
			getValueOfGraphic(options, "zIndex", "number", obj);
			this.packet.polygon = obj;
			return this;
		}
	}
	billboard(options) {
		console.log(options);
		if (!options) {
		} else {
			let obj = {};
			getValueOfGraphic(options, "show", "boolean", obj);
			//image
			obj.image = {
				uri: getValueOfGraphic(options, "image", "string"),
			};
			getValueOfGraphic(options, "scale", "number", obj);
			getValueOfGraphic(options, "pixelOffset", "pixelOffset", obj);
			getValueOfGraphic(options, "eyeOffset", "eyeOffset", obj);
			getValueOfGraphic(options, "horizontalOrigin", "horizontalOrigin", obj);
			getValueOfGraphic(options, "verticalOrigin", "verticalOrigin", obj);
			getValueOfGraphic(options, "heightReference", "heightReference", obj);
			getValueOfGraphic(options, "color", "rgba", obj);
			getValueOfGraphic(options, "rotation", "number", obj);
			if (options.alignedAxis)
				obj.alignedAxis = c({ propertyName: "unitCartesian", value: options.alignedAxis.getValue() });
			// getValueOfGraphic(options, "alignedAxis", "number", obj);
			getValueOfGraphic(options, "sizeInMeters", "boolean", obj);
			getValueOfGraphic(options, "width", "number", obj);
			getValueOfGraphic(options, "height", "number", obj);
			getValueOfGraphic(options, "scaleByDistance", "nearFarScalar", obj);
			getValueOfGraphic(options, "translucencyByDistance", "nearFarScalar", obj);
			getValueOfGraphic(options, "pixelOffsetScaleByDistance", "nearFarScalar", obj);
			getValueOfGraphic(options, "imageSubRegion", "boundingRectangle", obj);
			getValueOfGraphic(options, "distanceDisplayCondition", "distanceDisplayCondition", obj);
			getValueOfGraphic(options, "disableDepthTestDistance", "number", obj);
			this.packet.billboard = obj;
			return this;
		}
	}
	cb(func) {
		func(this);
		return this
	}
	end() {
		return this.packet;
	}
}
