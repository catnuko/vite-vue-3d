import { Operation } from "ht-components";
import Cesium from "dtcesium";
import { arrow } from "./drawArrow";
import img from './箭头_向右.png'
// const img = new URL("./array_right.png", import.meta.url).href;

export const configList = [
	{
		img: img,
		name: "双箭头",
		geometryCommandName: "pincerArrow",
	},
	{
		img: img,
		name: "直箭头",
		geometryCommandName: "straightArrow",
	},
	{
		img: img,
		name: "斜单尖箭头",
		geometryCommandName: "straightArrow",
	},
	{
		img: img,
		name: "斜箭头",
		geometryCommandName: "attackArrow",
	},
	{
		img: img,
		name: "自由绘面",
		geometryCommandName: "polygon",
	},
	{
		img: img,
		name: "直角旗",
		geometryCommandName: "point",
	},
	{
		img: img,
		name: "三角旗",
		geometryCommandName: "point",
	},
];
export class DrawCommand {
	operation: Operation;
	arrow = arrow
	constructor(private readonly viewer: Cesium.Viewer) {
		this.operation = new Operation({ viewer });
		this.arrow.disable();
		this.arrow.init(viewer);
	}
	draw(
		name: "pincerArrow" | "straightArrow" | "attackArrow" | "polygon" | "polyline" | "point" | "circle" | "rectangle"
	) {
		if (name.indexOf("Arrow") !== -1) {
			this.arrow.draw(name);
		} else {
			this.operation.interaction.draw(name);
		}
	}
}
