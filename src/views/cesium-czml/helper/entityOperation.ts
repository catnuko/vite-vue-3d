import { getDefer } from "ht-cesium-utils";
import * as EntityOp from "./entityOperation";
import * as PropertyCo from "./propertyCompute";
export function faceTo(entity, targetPosition) {
	let curPosition = entity.position.getValue();
	let orientation = PropertyCo.getOrientationOfA(curPosition, targetPosition);
	entity.orientation = orientation;
}
export async function moveMan(viewer, entity, start, end, cartesian3List) {
	let position = PropertyCo.positionWithConstVelocity(start, end, cartesian3List);
	let targetPosition = position.getValue(end);
	entity.position = position;
	entity.orientation = new Cesium.VelocityOrientationProperty(position);
	entity.model.runAnimations = true;
	await clock(viewer, end);
	entity.position = targetPosition;
	entity.model.runAnimations = false;
}
export function clock(clockOwner, time) {
	let defer = getDefer();
	const cb = () => {
		if (Cesium.JulianDate.greaterThanOrEquals(clockOwner.clock.currentTime, time)) {
			defer.resolve();
			clockOwner.clock.onTick.removeEventListener(cb);
		}
	};
	clockOwner.clock.onTick.addEventListener(cb);
	return defer.promise;
}
// let viewer:Cesium.Viewer
export function setTimeCallBack(clockOwner, callbackList) {
	let called = [];
	const cb = (clock) => {
		const currentTime = clock.currentTime
		callbackList.forEach((callbackOption) => {
			if (
				!called.find((t) => Cesium.JulianDate.equals(t, callbackOption.time)) &&
				Cesium.JulianDate.equalsEpsilon(currentTime, callbackOption.time, 1)
			) {
				callbackOption.handler(currentTime);
				called.push(currentTime);
			}
			if (called.length === callbackList.length) {
				clockOwner.clock.onTick.removeEventListener(cb);
			}
		});
	};
	clockOwner.clock.onTick.addEventListener(cb);
}