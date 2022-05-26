import { Packet } from "./Packet";
import { c, _c, getValueOfGraphic, toPromise } from "./utils";
export class CZML {
	constructor(czml) {
		if (czml) {
			this.czml = czml;
		} else {
			this.czml = [
				{
					id: "document",
					version: "1.0",
				},
			];
		}
	}
	setViewer(viewer) {
		this.viewer = viewer;
		let name = this.name();
		if (!name) {
			name = CZML.getId();
			this.name(name);
		}
		this.dataSource = new Cesium.CzmlDataSource(name);
		this.viewer.dataSources.add(this.dataSource);
		this.dataSource.load(this.czml);
		return this;
	}
	flyTo(flyToOption) {
		if (this.viewer) {
			this.viewer.flyTo(this.dataSource, flyToOption);
		}
		return this;
	}
	packet() {
		return this.czml.slice(1, this.czml.length);
	}
	clock(options) {
		console.log(options);
		if (!options) {
		} else {
			let obj = {};
			obj.currentTime = c({ propertyName: "julianDate", value: options.currentTime });
			getValueOfGraphic(options, "number", "multiplier", obj);
			obj.range = c({ propertyName: "clockRange", value: options.clockRange });
			obj.step = c({ propertyName: "clockStep", value: options.clockStep });
			if (options.startTime && options.stopTime) {
				let start = c({ propertyName: "julianDate", value: options.startTime });
				let end = c({ propertyName: "julianDate", value: options.stopTime });
				obj.interval = `${start}/${end}`;
			}
			this.czml[0].clock = obj;
			return this;
		}
	}
	name(name) {
		if (name) {
			this.czml[0].name = name;
			return this;
		} else {
			return this.czml[0].name;
		}
	}
	add(packet) {
		if (packet instanceof Packet) {
			this.czml.push(packet.end());
		} else {
			this.czml.push(packet);
		}
		return this;
	}
	remove(packet) {
		let i = this.czml.findIndex((p) => p.id === packet.id);
		if (i !== -1) {
			this.czml.splice(i, 1);
		}
		return this;
	}
	entity(entityOption) {}
	end() {
		return this.czml;
	}
}
CZML._id = 0;
CZML.getId = function () {
	return "czml_" + CZML._id;
};
