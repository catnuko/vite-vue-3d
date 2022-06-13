import * as PropertyCo from "./propertyCompute";
import * as EntityOp from "./entityOperation";
import { cameraFlyTo } from "ht-cesium-utils";
export function setTimeViewList(viewer, timeViewList) {
	let lastInterval;
	const cb = (clock) => {
		const currentTime = clock.currentTime;
		timeViewList.forEach((callbackOption) => {
			const interval = new Cesium.TimeInterval(callbackOption);
			if (
				!lastInterval ||
				(lastInterval &&
					!lastInterval.equals(interval, Cesium.JulianDate.equals) &&
					Cesium.TimeInterval.contains(interval, currentTime))
			) {
				cameraFlyTo(
					viewer,
					new Cesium.Cartesian3(...interval.data.destination),
					new Cesium.HeadingPitchRoll(...interval.data.hpr)
				);
				lastInterval = interval;
			}
		});
	};
	return viewer.clock.onTick.addEventListener(cb);
}
