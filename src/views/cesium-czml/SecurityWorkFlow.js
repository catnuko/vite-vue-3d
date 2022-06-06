import WorkFlow from "./WorkFlow";
import Box from "./Box";
export default class SecurityWorkFlow extends WorkFlow {
	constructor(viewer, title, tk) {
		super(viewer, title, tk);
		this.startPlace = "湖州市德清县武康镇双山路109号";
	}
	_setAccident(position, time,view) {
	}
}
