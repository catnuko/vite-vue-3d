import { Dayjs } from "dayjs";
import { getDefer } from "ht-cesium-utils";
import { dayjs, duration } from "./dayjs";
import { getRouteFromLonlat, getRouteFromPlace, getPlaceLocation } from "./routePlan";
import { Packet } from "./Packet";
import Billboard from "cesium/Source/Scene/Billboard";
export function toPromise(promise) {
	let defer = getDefer();
	promise.then((res) => {
		defer.resolve(res);
	});
	return defer.promise;
}
export function getValueOfGraphic(graphic, propertyNameOfGraphic, propertyName, obj) {
	if (!graphic) return;
	let v = graphic[propertyNameOfGraphic];
	if (v) {
		const res = c({ propertyName: propertyName, value: v.getValue ? v.getValue() : v });
		if (obj) {
			obj[propertyNameOfGraphic] = res;
		}
		return res;
	}
}
export function c(options) {
	const { propertyName, reference, startTime, endTime, duration } = options;
	let _vv = options.value;
	let value, valueType, res;
	if (Array.isArray(_vv)) {
		//如果是数组，肯定不是复合值
		valueType = "compositeValue";
		value = {
			[propertyName]: _vv.map((vi) => {
				let cValue = _c({ type: propertyName, value: vi });
				return cValue.value;
			}),
		};
	} else {
		//如果不是数组，可能是复合值或普通值
		let cValue = _c({ type: propertyName, value: _vv });
		valueType = cValue.valueType;
		if (cValue.valueType === "compositeValue") {
			value = {
				[propertyName]: cValue.value,
			};
		} else {
			value = cValue.value;
		}
	}
	//有引用，则添加引用。有时间，则计算对应的时间。
	if (valueType === "compositeValue") {
		res = value;
		if (reference) {
			res.reference = reference;
		}
		let list = res[propertyName];
		if (Array.isArray(list)) {
			if (startTime || duration || endTime) {
				let tr = timeRange({ start: startTime, end: endTime, duration: duration });
				let step = tr.duration.as("s") / list.length;
				let _listWithTime = [];
				for (let i = 0; i < list.length; i++) {
					let increment = dayjs.duration(i * step, "s");
					let _time = tr.start.add(increment).toISOString();
					let temp = [_time, ...list[i]];
					_listWithTime.push(temp);
				}
				res[propertyName] = _listWithTime;
			}
			res[propertyName] = res[propertyName].flat();
		}
	} else {
		res = value;
		if (reference) {
			res = {
				[valueType]: value,
				reference: reference,
			};
		}
	}
	return res;
}

export function _c(options) {
	const { type, value } = options;
	let _value, valueType;
	switch (type) {
		case "boundingRectangle":
			valueType = "compositeValue";
			_value = [value.x, value.y, value.width, value.height];
			break;
		case "distanceDisplayCondition":
			valueType = "compositeValue";
			_value = [value.near, value.far];
			break;
		case "nearFarScalar":
			valueType = "compositeValue";
			_value = [value.near, value.nearValue, value.far, value.farValue];
			break;
		case "unitCartesian":
			valueType = "compositeValue";
			let newValue = new Cesium.Cartesian3();
			Cesium.Cartesian3.normalize(value, newValue);
			_value = [newValue.x, newValue.y, newValue.z];
			break;
		case "cartesian":
			valueType = "compositeValue";
			_value = [value.x, value.y, value.z];
			break;

		case "cartesian2":
			valueType = "compositeValue";
			_value = [value.x, value.y];
			break;
		case "rgba":
			valueType = "compositeValue";
			_value = [value.red, value.green, value.blue, value.alpha].map((i) => i * 255);
			break;
		case "polylineOutline":
			valueType = "compositeValue";
			_value = {};
			getValueOfGraphic(value, "color", "rgba", _value);
			getValueOfGraphic(value, "outlineColor", "rgba", _value);
			getValueOfGraphic(value, "outlineWidth", "number", _value);
			getValueOfGraphic(value, "color", "rgba", _value);
			break;
		case "colorMaterialProperty":
			valueType = "compositeValue";
			_value = {};
			getValueOfGraphic(value, "color", "rgba", _value);
			break;
		case "material":
			valueType = "compositeValue";
			if (value instanceof Cesium.PolylineOutlineMaterialProperty) {
				const res = _c({ type: "polylineOutline", value: value });
				_value = {
					polylineOutline: res.value,
				};
			} else if (value instanceof Cesium.ColorMaterialProperty) {
				const res = _c({ type: "colorMaterialProperty", value: value });
				_value = {
					solidColor: res.value,
				};
			}
			break;
		case "horizontalOrigin":
			valueType = "string";
			switch (value) {
				case -1:
					_value = "LEFT";
					break;

				case 0:
					_value = "CENTER";
					break;

				case 1:
					_value = "RIGHT";
					break;
			}
			break;

		case "verticalOrigin":
			valueType = "string";
			switch (value) {
				case 0:
					_value = "CENTER";
					break;

				case 1:
					_value = "BOTTOM";
					break;

				case -1:
					_value = "TOP";
					break;

				case 2:
					_value = "BASELINE";
					break;
			}
			break;

		case "heightReference":
			valueType = "string";
			switch (value) {
				case 0:
					_value = "NONE";
					break;

				case 1:
					_value = "CLAMP_TO_GROUND";
					break;
				case 2:
					_value = "RELATIVE_TO_GROUND";
					break;
			}
			break;
		case "classificationType":
			valueType = "string";
			switch (value) {
				case 0:
					_value = "TERRAIN";
					break;

				case 1:
					_value = "CESIUM_3D_TILE";
					break;
				case 2:
					_value = "BOTH";
					break;
			}
			break;
		case "shadowMode":
			valueType = "string";
			switch (value) {
				case 0:
					_value = "DISABLED";
					break;

				case 1:
					_value = "ENABLED";
					break;
				case 2:
					_value = "CAST_ONLY";
					break;
				case 3:
					_value = "RECEIVE_ONLY";
					break;
			}
			break;
		case "clockRange":
			valueType = "string";
			switch (value) {
				case 0:
					_value = "UNBOUNDED";
					break;

				case 1:
					_value = "CLAMPED";
					break;
				case 2:
					_value = "LOOP_STOP";
					break;
			}
			break;
		case "clockStep":
			valueType = "string";
			switch (value) {
				case 0:
					_value = "TICK_DEPENDENT";
					break;

				case 1:
					_value = "SYSTEM_CLOCK_MULTIPLIER";
					break;
				case 2:
					_value = "SYSTEM_CLOCK";
					break;
			}
			break;
		case "arcType":
			valueType = "string";
			switch (value) {
				case 0:
					_value = "NONE";
					break;

				case 1:
					_value = "GEODESIC";
					break;
				case 2:
					_value = "RHUMB";
					break;
			}
			break;

		case "julianDate":
			valueType = "string";
			_value = Cesium.JulianDate.toIso8601(value);
			break;
		case "boolean":
		case "number":
		case "string":
			valueType = type;
			_value = value;
			break;
	}
	return { value: _value, valueType };
}
export type TimeRange = { start?: Dayjs; end?: Dayjs; duration?: duration.Duration };
/**
 * 给开始时间、结束时间、间隔其中的两个，补充另外一个。
 */
export function timeRange(options: TimeRange) {
	let _start = options.start,
		_end = options.end,
		_duration = options.duration;
	if (_duration) {
		if (_start) {
			_end = _start.add(_duration);
		} else if (_end) {
			_start = _end.subtract(_duration);
		}
	} else {
		_duration = dayjs.duration(_end.diff(_start));
	}
	return {
		start: _start,
		end: _end,
		duration: _duration,
	};
}
export function timeRangeToISOString(timeRange) {
	return `${timeRange.start.toISOString()}/${timeRange.end.toISOString()}`;
}
/**
 * 给开始时间和位置，结束时间和位置，图标和线路样式配置，生成一个Packet
 */
export async function makeRoutePacket(options: {
	id: string;
	start: { time: Dayjs; place?: string; position?: [number, number]; duration?: duration.Duration };
	end: { time: Dayjs; place?: string; position?: [number, number]; duration?: duration.Duration };
	billboardGraphic: Cesium.BillboardGraphics.ConstructorOptions;
	polylineGraphic: Cesium.PolylineGraphics.ConstructorOptions;
	tk: string;
}) {
	const { id, start, end, billboardGraphic, polylineGraphic, tk } = options;
	let tr = timeRange({ start: start.time, end: end.time, duration: start.duration ? start.duration : end.duration });
	let promiseList = [];
	if (!start.position) {
		promiseList.push(
			getPlaceLocation(start.place, tk).then((res) => {
				start.position = [res.lon, res.lat];
			})
		);
	}
	if (!end.position) {
		promiseList.push(
			getPlaceLocation(end.place, tk).then((res) => {
				end.position = [res.lon, res.lat];
			})
		);
	}
	await Promise.all(promiseList);
	const routes = await getRouteFromLonlat(start.position, end.position, tk);
	let route = routes[0];
	return new Packet({ id, name: id })
		.billboard(
			new Cesium.BillboardGraphics({
				...billboardGraphic,
			})
		)
		.position({ startTime: tr.start, endTime: tr.end, positions: route.cartesian3List })
		.polyline(
			new Cesium.PolylineGraphics({
				positions: route.cartesian3List,
				...polylineGraphic,
			})
		);
}
/**
 * 给开始时间，结束时间，生成一个Clock
 */
export function makeClock(timeRangeOption: TimeRange) {
	const tr = timeRange(timeRangeOption);
	return new Cesium.Clock({
		startTime: Cesium.JulianDate.fromIso8601(tr.start.toISOString()),
		currentTime: Cesium.JulianDate.fromIso8601(tr.start.toISOString()),
		stopTime: Cesium.JulianDate.fromIso8601(tr.end.toISOString()),
		clockRange: Cesium.ClockRange.LOOP_STOP,
		multiplier: 1,
	});
}
