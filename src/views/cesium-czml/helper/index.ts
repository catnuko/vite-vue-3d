import { info } from "./constant";
import { cameraFlyTo } from "ht-cesium-utils";
export function makeCzml(name: string) {
	return [
		{
			id: "document",
			version: "1.0",
			name,
		},
	];
}
export function makePath(){
	
}