import WorkFlow from "./WorkFlow";
import Box from "./Box";
export default class SecurityWorkFlow extends WorkFlow {
	constructor(viewer, title, tk) {
		super(viewer, title, tk);
		this.startPlace = "湖州市德清县武康镇双山路109号";
		this.setSteps([
			{
				num: 1,
				title: "了解情况",
				content: "了解现场情况",
			},
			{
				num: 2,
				title: "实时监控",
				content: "打开现场监控",
			},
			{
				num: 3,
				title: "派出人员",
				content: "派人处理事件",
			},
		]);
	}
}
