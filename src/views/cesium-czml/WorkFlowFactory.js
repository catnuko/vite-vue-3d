import FireWorkFlow from "./fireWorkFlow";
import SecurityWorkFlow from "./SecurityWorkFlow";
import TrafficWorkFlow from "./TrafficWorkFlow";
export function createWorkFlow(viewer, type, tk) {
	if (type === "火灾") {
		return new FireWorkFlow(viewer, type, tk);
	} else if (type === "斗殴") {
		return new SecurityWorkFlow(viewer, type, tk);
	} else if (type === "交通事故") {
		return new TrafficWorkFlow(viewer, type, tk);
	}
}
