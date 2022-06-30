import CzmlDataSource from "cesium/Source/DataSources/CzmlDataSource";
import { cameraFlyTo, getDefer } from "ht-cesium-utils";
import { v4 as uuidv4 } from "uuid";
import { clone } from "./packetOperation";
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
export type CzmlTimeIntervalState<T> = {
	state: T;
	time?: {
		//onTimeChange的调用时间被修改为[start+offset[0],end+offset[1]]
		offset: [number, number];
		unit: "seconds" | "minutes" | "hours" | "days";
	};
	onTimeChange: (news: T, isContain: Boolean) => T;
};
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
	setViewer(viewer: Cesium.Viewer) { }
	destroy(viewer) { }
	clone() {
		return Object.assign({}, this.innerValue);
	}
}
export class CzmlEntity implements ICzmlPacket<Cesium.Entity> {
	innerValue: Cesium.Entity;
	constructor(innerValueOption: Cesium.Entity.ConstructorOptions, isInnerValue) {
		if (isInnerValue) {
			this.innerValue = innerValueOption as any;
		} else {
			this.innerValue = new Cesium.Entity(innerValueOption);
		}
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
	constructor(innerValueOption: ParticleSystemOption, isInnerValue) {
		if (isInnerValue) {
			this.innerValue = innerValueOption as any;
		} else {
			this.innerValue = new Cesium.ParticleSystem(innerValueOption);
		}
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
		destination: number[];
		hpr: number[];
	};
}
/**
 * 自定义时间段，用来加载packet、entity和particleSystem，并控制其availability。
 *
 * 可添加状态和回调函数。
 *
 * 例如：1、到start时间时跳转视角。2、start到end时间段内，建筑是半透明的。
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
	add(iCzmlPacket, type = "packet", isInnerValue = false) {
		let innerPacket = iCzmlPacket;
		if (type === "entity" && isInnerValue) {
			innerPacket = new CzmlEntity(iCzmlPacket, isInnerValue);
		} else if (type === "particleSystem" && isInnerValue) {
			innerPacket = new CzmlParticleSystem(iCzmlPacket, isInnerValue);
		} else if (type === "packet") {
			innerPacket = new CzmlPacket(iCzmlPacket);
		}
		innerPacket.setAvailability(this.getAvailability());
		this.packets.set(innerPacket.getId(), innerPacket);
	}
	states: (CzmlTimeIntervalState<object> & { oldState?: object })[] = [];
	/**
	 * 可在进入时间段和退出时间段执行自定义函数
	 */
	addState<T extends object>(options: CzmlTimeIntervalState<T>) {
		this.states.push(options);
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
				primitiveList.push({
					interval: Cesium.TimeInterval.fromIso8601({ iso8601: availability }),
					czmlPrimitive: i,
				});
			}
		});
		this.setViewerhandle = viewer.clock.onTick.addEventListener((clock) => {
			primitiveList.forEach((i) => {
				i.czmlPrimitive.innerValue.show = Cesium.TimeInterval.contains(i.interval, clock.currentTime);
			});
		});
	}
	destroy() {
		this.setViewerhandle && this.setViewerhandle();
		this.packets.forEach((i) => i.destroy(this.viewer));
		destroyObject(this);
	}
	setView(view: { destination: [number, number, number]; hpr: [number, number, number] }) {
		const self = this;
		this.addState({
			state: {
				view: view,
			},
			time: {
				offset: [-3, 0],
				unit: "seconds",
			},
			onTimeChange(state, isContain) {
				if (isContain) {
					cameraFlyTo(
						self.viewer,
						new Cesium.Cartesian3(...state.view.destination),
						new Cesium.HeadingPitchRoll(...state.view.hpr)
					);
				}
				return state;
			},
		});
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
		this.watchState();
		let defer = getDefer();
		this.setClock(viewer.clock)
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
	watchState() {
		let stateList = this.czmlTimeIntervalList
			.filter((i) => i.states.length)
			.map((t) => {
				return t.states.map((state) => {
					let start = t.start;
					let end = t.end;
					if (state.time) {
						let startOffset = state.time.offset[0];
						let endOffset = state.time.offset[1];
						let method = "add" + titleCase(state.time.unit);
						if (startOffset !== 0) {
							Cesium.JulianDate[method](start, startOffset, start);
						}
						if (endOffset !== 0) {
							Cesium.JulianDate[method](end, endOffset, end);
						}
					}
					return new Cesium.TimeInterval({ start: start, stop: end, data: state });
				});
			})
			.flat();
		this.setTimeViewListHandle = this.viewer.clock.onTick.addEventListener((clock) => {
			const currentTime = clock.currentTime;
			stateList.forEach((interval) => {
				let stateOption = interval.data;
				stateOption.isContain = Cesium.TimeInterval.contains(interval, currentTime);
				if (stateOption.oldIsContain !== stateOption.isContain) {
					let newState = stateOption.onTimeChange(stateOption.state, stateOption.isContain);
					stateOption.oldState = clone(stateOption.state);
					stateOption.state = clone(newState);
				}
				stateOption.oldIsContain = stateOption.isContain;
			});
		});
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

function titleCase(str) {
	return str.slice(0, 1).toUpperCase() + str.slice(1).toLowerCase();
}
export function createView(time: Cesium.JulianDate, view: {
	destination: number[];
	hpr: number[];
}) {
	return new CzmlTimeInterval({ start: time, end: Cesium.JulianDate.addSeconds(time, 3, new Cesium.JulianDate()), view: view })
}