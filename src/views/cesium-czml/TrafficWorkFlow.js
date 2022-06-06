import WorkFlow from "./WorkFlow";
import Box from "./Box";
export default class TrafficWorkFlow extends WorkFlow {
	constructor(viewer, title, tk) {
		super(viewer, title, tk);
		this.startPlace = "湖州市德清县武康镇武源街125号"
	}
	setAccident(position, time,view) {
		this.beforeSetAccident(position, time,view)

	}
}