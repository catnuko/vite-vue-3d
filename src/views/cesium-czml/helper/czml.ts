export class CzmlTimeInterval {
	view: {
		cameraPosition: Cesium.Cartesian3;
		cameraHpr: Cesium.HeadingPitchRoll;
	};
	packets: object[];
	timeInterval: Cesium.TimeInterval;
	constructor(readonly start: Cesium.JulianDate, readonly end: Cesium.JulianDate) {
		this.timeInterval = new Cesium.TimeInterval({ start, stop: end });
		this.view = undefined;
		this.packets = [];
	}
	setView(position, hpr) {
		this.view = {
			cameraPosition: new Cesium.Cartesian3(...position),
			cameraHpr: new Cesium.HeadingPitchRoll(...hpr),
		};
	}
	passPacket(packet) {
		let timeInterval = Cesium.TimeInterval.fromIso8601({ iso8601: packet.availability });
        // Cesium.TimeInterval.intersect
		this.packets.push();
	}
}
