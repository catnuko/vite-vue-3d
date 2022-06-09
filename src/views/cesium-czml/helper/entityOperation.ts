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
	await clock(viewer, start, end);
	entity.position = targetPosition;
	entity.model.runAnimations = false;
}
export function clock(viewer, start, end) {
	let defer = getDefer();
	let clock = new Cesium.Clock({
		startTime: start,
		stopTime: end,
		currentTime: start,
		multiplier: 1,
		shouldAnimate: true,
		clockRange: Cesium.ClockRange.CLAMPED,
	});
	const cb = () => {
		if (Cesium.JulianDate.greaterThanOrEquals(clock.currentTime, end)) {
			defer.resolve();
			clock.onTick.removeEventListener(cb);
			clock = null;
			viewer.clock.onTick.removeEventListener(cb2);
		}
	};
	clock.onTick.addEventListener(cb);
	const cb2 = () => {
		clock.multiplier = viewer.clock.multiplier;
		clock.tick();
	};
	viewer.clock.onTick.addEventListener(cb2);
	return defer.promise;
}
