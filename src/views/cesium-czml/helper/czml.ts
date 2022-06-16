import CzmlDataSource from "cesium/Source/DataSources/CzmlDataSource";
import { getDefer } from "ht-cesium-utils";
import { v4 as uuidv4 } from "uuid";
import { setTimeViewList } from "./viewOperation";
// export interface IPacket {
// 	availability: string;
// }
export type ParticleSystemOption = {
	show?: boolean;
	updateCallback?: Cesium.ParticleSystem.updateCallback;
	emitter?: Cesium.ParticleEmitter;
	modelMatrix?: Cesium.Matrix4;
	emitterModelMatrix?: Cesium.Matrix4;
	emissionRate?: number;
	bursts?: Cesium.ParticleBurst[];
	loop?: boolean;
	scale?: number;
	startScale?: number;
	endScale?: number;
	color?: Cesium.Color;
	startColor?: Cesium.Color;
	endColor?: Cesium.Color;
	image?: any;
	imageSize?: Cesium.Cartesian2;
	minimumImageSize?: Cesium.Cartesian2;
	maximumImageSize?: Cesium.Cartesian2;
	sizeInMeters?: boolean;
	speed?: number;
	minimumSpeed?: number;
	maximumSpeed?: number;
	lifetime?: number;
	particleLife?: number;
	minimumParticleLife?: number;
	maximumParticleLife?: number;
	mass?: number;
	minimumMass?: number;
	maximumMass?: number;
};
export type IPacket = any;
export interface ICzmlPacket<InnerValue> {
	innerValue: InnerValue;
	setAvailability(availability: string): void;
	getAvailability(): string;
	getId(): string;
	addToCollection<T extends Cesium.Viewer | any[]>(collection: T): InnerValue;
	setViewer(viewer: Cesium.Viewer);
	destroy(viewer);
}
export class CzmlPacket implements ICzmlPacket<IPacket> {
	innerValue: IPacket;
	constructor(innerValue: IPacket) {
		this.innerValue = innerValue;
	}
	setAvailability(availability: string): void {
		this.innerValue.availability = availability;
	}
	getAvailability(): string {
		return this.innerValue.availability;
	}
	getId(): string {
		return this.innerValue.id;
	}
	addToCollection<T extends Cesium.Viewer | any[]>(collection: T) {
		if (!(collection instanceof Cesium.Viewer)) {
			collection.push(this.innerValue);
		}
		return this.innerValue;
	}
	setViewer(viewer: Cesium.Viewer) {}
	destroy(viewer) {}
	clone() {
		return Object.assign({}, this.innerValue);
	}
}
export class CzmlEntity implements ICzmlPacket<Cesium.Entity> {
	innerValue: Cesium.Entity;
	constructor(innerValueOption: Cesium.Entity.ConstructorOptions) {
		this.innerValue = new Cesium.Entity(innerValueOption);
	}

	setAvailability(availability: string): void {
		processAvailability(this.innerValue, { availability: availability });
	}
	getAvailability(): string {
		return Cesium.TimeInterval.toIso8601(
			this.innerValue.availability.findInterval({
				start: this.innerValue.availability.start,
				stop: this.innerValue.availability.stop,
			})
		);
	}
	getId(): string {
		return this.innerValue.id;
	}
	addToCollection<T extends Cesium.Viewer | any[]>(collection: T): Cesium.Entity {
		return this.innerValue;
	}
	setViewer(viewer: Cesium.Viewer) {
		viewer.entities.add(this.innerValue);
	}
	destroy(viewer) {
		viewer.entities.remove(this.innerValue);
	}
}
export class CzmlParticleSystem implements ICzmlPacket<Cesium.ParticleSystem> {
	innerValue: Cesium.ParticleSystem;
	availability = "";
	id = uuidv4();
	constructor(innerValueOption?: ParticleSystemOption) {
		this.innerValue = new Cesium.ParticleSystem(innerValueOption);
	}
	setAvailability(availability: string): void {
		this.availability = availability;
	}
	getAvailability(): string {
		return this.availability;
	}
	getId(): string {
		return this.id;
	}
	addToCollection<T extends Cesium.Viewer | any[]>(collection: T): Cesium.ParticleSystem {
		return this.innerValue;
	}
	setViewer(viewer: Cesium.Viewer) {
		viewer.scene.primitives.add(this.innerValue);
	}
	destroy(viewer) {
		viewer.scene.primitives.remove(this.innerValue);
	}
}
export interface CzmlTimeIntervalOptions {
	id?: string;
	start: Cesium.JulianDate;
	end: Cesium.JulianDate;
	label?: string;
	view?: {
		destination: [number, number, number];
		hpr: [number, number, number];
	};
}
/**
 * 自定义时间段，用来加载packet、entity和particleSystem，并控制其availability。
 * 
 * 开始|_________________________________________________________________________|结束
 *
 *     <---startTo----|____________a____________|---------endTo---------------->|
 *
 * 									|____________b_______________|
 *
 * 					  |______________merge(a,b)__________________|
 */
export class CzmlTimeInterval {
	view: {
		destination: [number, number, number];
		hpr: [number, number, number];
	};
	packets: Map<string, ICzmlPacket<any>>;
	timeInterval: Cesium.TimeInterval;
	start: Cesium.JulianDate;
	end: Cesium.JulianDate;
	label = "";
	id: string;
	push: Function;
	czml: object;
	constructor(readonly options: CzmlTimeIntervalOptions) {
		if (options.id) {
			this.id = options.id;
		} else {
			this.id = uuidv4();
		}
		this.start = options.start;
		this.end = options.end;
		if (options.label) {
			this.label = options.label;
		}
		if (options.view) {
			this.setView(options.view);
		}
		this.timeInterval = new Cesium.TimeInterval({ start: this.start, stop: this.end });
		this.setView(options.view)
		// this.packets = new Cesium.AssociativeArray();
		this.packets = new Map();
		const self = this;
		this.czml = {
			find(cb) {
				return self.getCzmlPackets().find(cb);
			},
			push(info) {
				return self.add(info);
			},
		};
	}
	getAvailability() {
		return Cesium.TimeInterval.toIso8601(this.timeInterval);
	}
	getCzmlPackets(): CzmlPacket[] {
		let list = [];
		this.packets.forEach((i) => {
			if (i instanceof CzmlPacket) {
				list.push(i.innerValue);
			}
		});
		return list;
	}
	getPackets(): IPacket[] {
		let list: IPacket[] = [];
		this.packets.forEach((i) => {
			list.push(i);
		});
		return list;
	}
	endTo(cesiumTimeInterval: CzmlTimeInterval) {
		this.setEnd(cesiumTimeInterval.end);
	}
	startTo(cesiumTimeInterval: CzmlTimeInterval) {
		this.setStart(cesiumTimeInterval.start);
	}
	setStart(time) {
		this.start = time;
		this.updateTimeInterval();
	}
	setEnd(time) {
		this.end = time;
		this.updateTimeInterval();
	}
	updateTimeInterval() {
		if (this.start && this.end) {
			this.timeInterval = new Cesium.TimeInterval({ start: this.start, stop: this.end });
			this.getPackets().forEach((i) => {
				i.setAvailability();
			});
		}
	}
	add(iCzmlPacket, type = "packet", needBuilder=true) {
		let innerPacket = iCzmlPacket;
		if (type === "entity" && needBuilder) {
			innerPacket = new CzmlEntity(iCzmlPacket);
		} else if (type === "particleSystem" && needBuilder) {
			innerPacket = new CzmlParticleSystem(iCzmlPacket);
		} else if (type === "packet" && needBuilder) {
			innerPacket = new CzmlPacket(iCzmlPacket);
		}
		innerPacket.setAvailability(this.getAvailability());
		this.packets.set(innerPacket.getId(), innerPacket);
	}
	setViewerhandle;
	viewer;
	setViewer(viewer: Cesium.Viewer) {
		this.viewer = viewer;
		this.packets.forEach((i) => {
			i.setViewer(viewer);
		});
		let primitiveList = [];
		this.packets.forEach((i) => {
			if (i instanceof CzmlParticleSystem) {
				let availability = i.getAvailability();
				primitiveList.push(Cesium.TimeInterval.fromIso8601({ iso8601: availability }));
			}
		});
		this.setViewerhandle = viewer.clock.onTick.addEventListener((clock) => {
			primitiveList.forEach((i) => {
				i.innerValue.show = Cesium.TimeInterval.contains(i, clock.currentTime);
			});
		});
	}
	destroy() {
		this.setViewerhandle && this.setViewerhandle();
		this.packets.forEach((i) => i.destroy(this.viewer));
		destroyObject(this);
	}
	setView(view: { destination: [number, number, number]; hpr: [number, number, number] }) {
		this.view = view;
	}
	/**
	 * 合并两个时间间隔
	 * 时间段合并：求两个时间段的并集，比如[start,start+2],[start+1,start+3],结果：[start,start+3]
	 * packet合并：相同ID后者往前者合并，不同ID不合并。
	 * @param ti1 CzmlTimeInterval
	 * @param ti2 CzmlTimeInterval
	 * @returns new CzmlTimeInterval
	 */
	static merge(ti1: CzmlTimeInterval, ti2: CzmlTimeInterval): CzmlTimeInterval {
		if (!CzmlTimeInterval.mergeValid(ti1, ti2)) {
			return;
		}
		//找出最大时间和最小时间
		let timeList = [ti1.start, ti1.end, ti2.start, ti2.end];
		timeList.sort((a, b) => {
			return Cesium.JulianDate.secondsDifference(b, a);
		});
		let res = new CzmlTimeInterval({ start: timeList[0], end: timeList[3] });
		//合并packet
		let list = [].concat(ti1.packets.values, ti2.packets.values);
		let newList = {};
		list.forEach((packet) => {
			let old = newList[packet.id];
			if (!old) {
				newList[packet.id] = packet;
			} else {
				let newPacket = Object.assign(old, packet);
				newList[old.id] = newPacket;
			}
		});
		for (let id in newList) {
			res.add(newList[id]);
		}
		return res;
	}
	static mergeValid(ti1: CzmlTimeInterval, ti2: CzmlTimeInterval) {
		let newti = Cesium.TimeInterval.intersect(ti1.timeInterval, ti2.timeInterval);
		let res = !newti.isEmpty;
		if (!res) {
			console.error("ti1和ti2两者的时间段不重叠", ti1, ti2);
		}
		return res;
	}
}
/**
 * 取代czmlDataSource.load()
 */
export class CzmlTimeIntervalShow {
	czml: any[];
	czmlTimeIntervalList: CzmlTimeInterval[];
	czmlDataSource: Cesium.CzmlDataSource;
	viewer;
	setTimeViewListHandle;
	constructor(czmlTimeIntervalList) {
		let czml = [
			{
				id: "document",
				version: "1.0",
			},
		];
		this.czml = czml;
		this.setTimeIntervalList(czmlTimeIntervalList);
	}
	setTimeIntervalList(czmlTimeIntervalList) {
		this.czmlTimeIntervalList = czmlTimeIntervalList;
	}
	setClock(clock) {
		this.czml[0].clock = clock;
	}
	toCzml() {
		for (let i = 0; i < this.czmlTimeIntervalList.length; i++) {
			let cur = this.czmlTimeIntervalList[i];
			let packets = cur.getCzmlPackets();
			this.czml = this.czml.concat(packets);
		}
		return this.czml;
	}
	setViewer(viewer) {
		this.czmlDataSource = new Cesium.CzmlDataSource("testCzmlDataSource");
		viewer.dataSources.add(this.czmlDataSource);
		this.viewer = viewer;
		this.initView();
		let defer = getDefer();
		const czml = this.toCzml();
		console.log(czml);
		this.czmlTimeIntervalList.forEach((i) => {
			i.setViewer(viewer);
		});
		this.czmlDataSource.load(czml).then(() => {
			defer.resolve();
		});
		return defer.promise;
	}
	destroy() {
		this.czmlTimeIntervalList.forEach((i) => {
			i.destroy();
		});
		this.viewer.dataSources.remove(this.czmlDataSource);
		this.setTimeViewListHandle && this.setTimeViewListHandle();
		destroyObject(this);
	}
	initView() {
		let viewList = this.czmlTimeIntervalList
			.filter((i) => i.view)
			.map((timeInterval: CzmlTimeInterval) => {
				return {
					start: timeInterval.start,
					stop: Cesium.JulianDate.addSeconds(timeInterval.start, 1.5, new Cesium.JulianDate()),
					data: timeInterval.view,
				};
			});
		this.setTimeViewListHandle = setTimeViewList(this.viewer, viewList);
	}
}
function processAvailability(entity, packet) {
	var packetData = packet.availability;
	if (!defined(packetData)) {
		return;
	}

	var intervals;
	if (Array.isArray(packetData)) {
		for (var i = 0, len = packetData.length; i < len; ++i) {
			if (!defined(intervals)) {
				intervals = new Cesium.TimeIntervalCollection();
			}
			intervals.addInterval(intervalFromString(packetData[i]));
		}
	} else {
		intervals = new Cesium.TimeIntervalCollection();
		intervals.addInterval(intervalFromString(packetData));
	}
	entity.availability = intervals;
}
var iso8601Scratch = {
	iso8601: undefined,
};

function intervalFromString(intervalString) {
	if (!defined(intervalString)) {
		return undefined;
	}
	iso8601Scratch.iso8601 = intervalString;
	return Cesium.TimeInterval.fromIso8601(iso8601Scratch);
}
function defined(value) {
	return value !== undefined && value !== null;
}
function destroyObject(object) {
	for (var key in object) {
		delete object[key];
	}
}
