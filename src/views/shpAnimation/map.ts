import * as d3 from "d3";
import { Selection } from "d3";
import { FeatureCollection, Polygon, Feature as $Feature } from "geojson";
import * as turf from "@turf/turf";
import { MultiPolygon } from "@turf/turf";
import { outlineGeojson } from "./f";
import { geoNaturalEarth1, geoTransverseMercator } from "d3-geo";
import { transformDirection, transformPoint, identity, xRotate, xRotation } from "./math";
import { makeVilliageByColor, makeVilliage, getCurrentPlaceLabel } from "./svg";
import mitt from "mitt";
import TestData from "./ne_10m_populated_places_simple";

type Geometry = Polygon | MultiPolygon;
type SVG = Selection<SVGSVGElement, unknown, HTMLElement, any>;
type GeoJson = FeatureCollection<
	Geometry,
	{
		乡: string;
		县: string;
		市: string;
		省: string;
		center: any;
		isBlue: boolean;
		geom: string;
		path: any;
	}
>;
type Properties = {
	center: any;
	path: any;
	isBlue: boolean;
	乡: string;
	县: string;
	市: string;
	省: string;
};
type Feature<P = Properties> = $Feature<Geometry, P>;
type Bounds = [[number, number], [number, number]];

export interface MapConfig {
	town: string;
	avaliableVillageList: string[];
	showVillage: {
		name: string;
		enName: string;
		position: [number, number];
	};
}

export interface DecodedShp {
	geojson: GeoJson;
	outlineFeature: Feature;
	geoPath: d3.GeoPath;
	projection: d3.GeoProjection;
	bounds: Bounds;
}

const EVENT = {
	LABEL_CLICK: "LABEL_CLICK",
};
import { getRotation } from "./versor";
/**
 * 中文乱码解决方式，修改shp.js源文件，搜索替换下面语句
 * var decoder = createDecoder(encoding||"gbk");
 */
const SHP_FILE_PATH = "http://localhost:3000/data/乐清市街道.zip";
const LEVEL = 5;
const ROTATE = 50;
const MAX_NUM = 2;
const MIN_LINE_HEIGHT = 40;
const MAX_LINE_HEIGHT = 100;
const ICON_WIDTH = 179.64;
const ICON_HEIGHT = 94.31;
const mapConfig: MapConfig = {
	town: "柳市镇",
	avaliableVillageList: [],
	showVillage: {
		name: "黄花村",
		enName: "HUANG HUA CUN",
		position: [120.93491643062, 28.002968757927],
	},
};
let mitter = mitt();
let svgId = 0;
export function makeSvgId() {
	return `svg-map-${svgId++}`;
}
export async function main(id: string, changJingName: string) {
	const svgRoot = makeSvg(id);
	const { width, height } = getSizeOfSvg(svgRoot);
	const geojson = await (window as any).shp(SHP_FILE_PATH);
	// await makeSphere(svgRoot, decodedShp);

	// let removeTownLayer = makeTownLayer(svgRoot, decodedShp, mapConfig)
	let removeTownLayer;
	if (changJingName === "登录") {
		const decodedShp = processShp(geojson, width, height);
		let townFeature = decodedShp.geojson.features.find((f) => f.properties.乡 === mapConfig.town);
		if (!townFeature) {
			console.error("townFeature not found");
			return;
		}
		let newGeojson = {
			type: "FeatureCollection",
			features: [townFeature],
		};
		const villageDecodedShp = processShp(newGeojson, width, height, townFeature);
		let removeGgImg = makeBgImg(svgRoot);
		let removeBaseMap = makeBaseMap(svgRoot, LEVEL, villageDecodedShp);
		let removeCurrentPlaceLabel = makeCurrentPlaceLabel(svgRoot, villageDecodedShp);
		let removeFlyLine = makeFlyLine(svgRoot, villageDecodedShp.bounds);
		removeTownLayer = () => {
			removeGgImg && removeGgImg();
			removeBaseMap && removeBaseMap();
			removeFlyLine && removeFlyLine();
			removeCurrentPlaceLabel && removeCurrentPlaceLabel();
		};
	} else if (changJingName === "各乡镇") {
		const decodedShp = processShp(geojson, width, height);
		initRenderData(decodedShp, mapConfig);

		let removeCurrentPlaceLabel;
		let removeGgImg = makeBgImg(svgRoot);
		let removeBaseMap = makeBaseMap(svgRoot, LEVEL, decodedShp);
		let removePlaceLabel = makePlaceLabel(svgRoot, true, decodedShp, {
			onClick(i, data) {
				mitter.emit(EVENT.LABEL_CLICK, data);
			},
		});
		let removeFlyLine = makeFlyLine(svgRoot, decodedShp.bounds);
		return () => {
			removeGgImg();
			removeBaseMap();
			removePlaceLabel();
			removeFlyLine();
			removeCurrentPlaceLabel && removeCurrentPlaceLabel();
		};
	} else if (changJingName === "乡镇详情") {
		const decodedShp = processShp(geojson, width, height);
		let townFeature = decodedShp.geojson.features.find((f) => f.properties.乡 === mapConfig.town);
		if (!townFeature) {
			console.error("townFeature not found");
			return;
		}
		let newGeojson = {
			type: "FeatureCollection",
			features: [townFeature],
		};
		const villageDecodedShp = processShp(newGeojson, width, height, townFeature);
		let removeGgImg = makeBgImg(svgRoot);
		let removeBaseMap = makeBaseMap(svgRoot, LEVEL, villageDecodedShp);
		let removeCurrentPlaceLabel = makeCurrentPlaceLabel(svgRoot, villageDecodedShp);
		let removeFlyLine = makeFlyLine(svgRoot, villageDecodedShp.bounds);
		removeTownLayer = () => {
			removeGgImg && removeGgImg();
			removeBaseMap && removeBaseMap();
			removeFlyLine && removeFlyLine();
			removeCurrentPlaceLabel && removeCurrentPlaceLabel();
		};
	}

	return {
		dstroy() {
			removeTownLayer && removeTownLayer();
			svgRoot.remove();
		},
		on: mitter.on.bind(mitter),
		off: mitter.off.bind(mitter),
		EVENT: EVENT,
		// switchLayer(feature) {
		// 	removeTownLayer && removeTownLayer()
		// 	removeTownLayer = makeVillageLayer(
		// 		svgRoot,
		// 		decodedShp,
		// 		mapConfig,
		// 		feature,
		// 		changJingName !== '登录'
		// 	)
		// },
	};
}

export function initRenderData(decodedShp: DecodedShp, mapConfig: MapConfig) {
	decodedShp.geojson.features.forEach((f: any) => {
		if (f.properties.乡 === mapConfig.town) {
			f.properties.isBlue = true;
		} else {
			f.properties.isBlue = false;
		}
	});
}

function makeTownLayer(svgRoot: SVG, decodedShp: DecodedShp, mapConfig: MapConfig) {
	let removeCurrentPlaceLabel;
	let removeGgImg = makeBgImg(svgRoot);
	let removeBaseMap = makeBaseMap(svgRoot, LEVEL, decodedShp);
	let removePlaceLabel = makePlaceLabel(svgRoot, true, decodedShp, {
		onClick(i, data) {
			let town = data.properties["乡"];
			mitter.emit(EVENT.LABEL_CLICK, data);
			if (mapConfig.town === town) {
				removeBaseMap();
				removePlaceLabel();
				removeFlyLine();
				const { width, height } = getSizeOfSvg(svgRoot);
				let geojson = {
					type: "FeatureCollection",
					features: [data],
				};
				const villageDecodedShp = processShp(geojson, width, height, data);
				removeBaseMap = makeBaseMap(svgRoot, LEVEL, villageDecodedShp);
				removePlaceLabel = makePlaceLabel(svgRoot, true, decodedShp, {
					onClick(i, data) {
						console.log(data, mapConfig.showVillage);
					},
				});
				removeCurrentPlaceLabel = makeCurrentPlaceLabel(svgRoot, decodedShp);
				removeFlyLine = makeFlyLine(svgRoot, villageDecodedShp.bounds);
			} else {
				console.error("点错了", data);
			}
		},
	});
	let removeFlyLine = makeFlyLine(svgRoot, decodedShp.bounds);
	return () => {
		removeGgImg();
		removeBaseMap();
		removePlaceLabel();
		removeFlyLine();
		removeCurrentPlaceLabel && removeCurrentPlaceLabel();
	};
}

function makeVillageLayer(
	svgRoot: SVG,
	decodedShp: DecodedShp,
	mapConfig: MapConfig,
	feature: Feature,
	isPlaceLabel: boolean
) {
	const { width, height } = getSizeOfSvg(svgRoot);
	let geojson = {
		type: "FeatureCollection",
		features: [feature],
	};
	let removePlaceLabel, removeGgImg, removeBaseMap, removeCurrentPlaceLabel, removeFlyLine;
	const villageDecodedShp = processShp(geojson, width, height, feature);
	removeGgImg = makeBgImg(svgRoot);
	removeBaseMap = makeBaseMap(svgRoot, LEVEL, villageDecodedShp);
	if (isPlaceLabel) {
		removePlaceLabel = makePlaceLabel(svgRoot, true, decodedShp, {
			onClick(i, data) {
				console.log(data, mapConfig.showVillage);
			},
		});
	}
	removeCurrentPlaceLabel = makeCurrentPlaceLabel(svgRoot, villageDecodedShp);
	removeFlyLine = makeFlyLine(svgRoot, villageDecodedShp.bounds);
	return () => {
		removeGgImg && removeGgImg();
		removeBaseMap && removeBaseMap();
		removePlaceLabel && removePlaceLabel();
		removeFlyLine && removeFlyLine();
		removeCurrentPlaceLabel && removeCurrentPlaceLabel();
	};
}

function processShp(geojson, width, height, outlineFeature?: Feature): DecodedShp {
	let innerOutlineFeature = outlineFeature;
	if (!outlineFeature) {
		innerOutlineFeature = getOutlineOfGeojson(geojson) as any;
	}
	const geoPath = makeGeoPath(width, height, geojson);
	const bounds = geoPath.bounds(geojson);
	return {
		geojson,
		outlineFeature: innerOutlineFeature as any,
		geoPath,
		bounds,
		width,
		height,
		projection: geoPath.projection(),
	};
}
import TestData2 from "./test2.js";
function makeGeoPath(width, height, geojson: GeoJson) {
	let rotation = getRotation(geojson);
	console.log(rotation);
	let projection = d3.geoOrthographic().rotate(rotation).fitSize([width, height], geojson);
	return d3.geoPath(projection);
}

function makeSvg(id: string): SVG {
	const container = document.getElementById(id);
	const width = container?.clientWidth;
	const height = container?.clientHeight;
	const svgRoot = d3
		.select(`#${id}`)
		.append("svg")
		.attr("width", width || 0)
		.attr("height", height || 0);
	return svgRoot as any;
}

function getSizeOfSvg(svgRoot: SVG) {
	return {
		width: Number(svgRoot.attr("width")),
		height: Number(svgRoot.attr("height")),
	};
}

function makeCurrentPlaceLabel(svgRoot: SVG, decodedShp: DecodedShp) {
	let center = decodedShp.projection(mapConfig.showVillage.position) as [number, number];
	console.log("center");
	console.log(center);
	// let WIDTH = 178
	// let HEIGHT = 217
	// let x = 1000
	// let y = 500
	// let mat4 = getTransformMatrixOfElement('.base-map-container')
	let html = getCurrentPlaceLabel(mapConfig.showVillage.name, mapConfig.showVillage.enName);

	let g = svgRoot.append("g").html(html).attr("class", "current-place-label");
	g.attr("style", function (data) {
		// let center = [x, y]
		// center[0] -= WIDTH / 2
		// center[1] -= HEIGHT
		// center.push(0)
		// center = transformPoint(mat4, center) as any
		let node = g.node();
		console.log(node.clientWidth, node.clientHeight);
		let w = 286;
		let h = 362;
		let tox = 0.8;
		let toy = 1;
		let SCALE = 0.4;
		// w = w * tox * -1;
		// h = h * toy * -1;
		// let x = center[0] + SCALE + w;
		// let y = center[1] + SCALE * h;
		let { x, y } = getTranslateByScale(center[0], center[1], w, h, tox, toy, SCALE);
		return `cursor:pointer;transform:translate(${x}px, ${y}px) scale(${SCALE});`;
	}).on("click", function (data) {
		mitter.emit(EVENT.LABEL_CLICK, data);
	});
	return () => {
		d3.select(".current-place-label").remove();
	};
}

function makeBgGrid(svgRoot: SVG, projection: d3.GeoProjection) {
	const gridGenerator = d3.geoGraticule();
	const path = d3.geoPath(projection);
	svgRoot
		.append("g")
		.attr("class", "grid")
		.append("path")
		.datum(gridGenerator)
		.attr("class", "graticule")
		.attr("d", path)
		.attr("stroke-width", "1px")
		.attr("stroke", "red");
}

function makeFlyLine(svgRoot: SVG, bounds: Bounds) {
	const data = makeRange(0, MAX_NUM).map((x) => ({
		num: 1,
		x1: 0,
		y1: 0,
		x2: 0,
		y2: 0,
		height: 0,
		time: 0,
	}));
	const width = bounds[1][0] - bounds[0][0];
	const height = bounds[1][1] - bounds[0][1];
	const xRandom = d3.randomUniform(bounds[0][0], bounds[1][0]);
	const yRandom = d3.randomUniform(bounds[0][1], bounds[1][1]);
	const heightRandom = d3.randomUniform(MIN_LINE_HEIGHT, MAX_LINE_HEIGHT);
	const scale = d3.scaleLinear().domain([MIN_LINE_HEIGHT, MAX_LINE_HEIGHT]).range([4, 6]);
	const container = svgRoot
		.append("g")
		.attr("class", "flyline-container")
		.attr("width", width)
		.attr("height", height)
		.selectAll("line")
		.data(data)
		.enter();
	const line = container
		.append("line")
		.attr("stroke", function (data, index) {
			return `url(#flyline-symbol-${index})`;
		})
		.attr("stroke-width", 4)
		.attr("stroke-opacity", 1)
		.attr("x1", function (data, index) {
			data.x1 = xRandom();
			return data.x1;
		})
		.attr("y1", function (data, index) {
			data.y1 = yRandom();
			return data.y1;
		})
		.attr("x2", function (data, index) {
			data.x2 = data.x1;
			return data.x2;
		})
		.attr("y2", function (data, index) {
			data.height = heightRandom();
			data.time = scale(data.height);
			data.y2 = data.y1 - data.height;
			return data.y2;
		});
	container
		.append("defs")
		.append("linearGradient")
		.attr("id", function (data, index) {
			return `flyline-symbol-${index}`;
		})
		.attr("x1", function (data, index) {
			return data.x1 + 0.5;
		})
		.attr("y1", function (data, index) {
			return data.y2;
		})
		.attr("x2", function (data, index) {
			return data.x2 + 0.5;
		})
		.attr("y2", function (data, index) {
			return data.y1 + 0.5;
		})
		.attr("gradientUnits", "userSpaceOnUse")
		.html(function (data) {
			return `<stop stop-color="#EDF9FF" stop-opacity="1"/>
    <stop offset="0.2" stop-color="#4CC3FF" stop-opacity="0.713542">
        <animate
          attributeName="stop-opacity"
          values="1; 1; 0"
          begin='0s'  
          :dur="${data.time}s"
          repeatCount="indefinite"
        />
    </stop>
    <stop offset="1" stop-color="#214662" stop-opacity="0"/>`;
		});
	line
		.append("animate")
		.attr("attributeName", "y2")
		.attr("attributeType", "XML")
		.attr("begin", "0s")
		.attr("dur", function (data) {
			return `${data.time}s`;
		})
		.attr("repeatCount", "indefinite")
		.attr("values", function (data) {
			return `${data.y1}; ${data.y1 + 20 - data.height};${data.y2}`;
		});
	line
		.append("animate")
		.attr("attributeName", "y1")
		.attr("attributeType", "XML")
		.attr("begin", "0s")
		.attr("dur", function (data) {
			return `${data.time}s`;
		})
		.attr("repeatCount", "indefinite")
		.attr("values", function (data) {
			return `${data.y1}; ${data.y1 - 1};${data.y2}`;
		});
	return () => {
		d3.select(".flyline-container").remove();
	};
}

function makeBgImg(svgRoot: any) {
	const { width, height } = getSizeOfSvg(svgRoot);
	const DURATION = 15 * 1000;
	svgRoot
		.append("image")
		.attr("class", "background-img")
		.attr("width", width)
		.attr("height", height)
		.attr("xlink:href", new URL("./login-ani-bg.png", import.meta.url).href);
	const scale = d3.scaleLinear();
	scale.domain([0, DURATION]).range([0, 1]);
	let timer = d3.timer(function (elapsed) {
		const t = elapsed % DURATION;
		let s = scale(t);
		d3.select(".background-img").attr("style", function () {
			return `transform:rotateX(${ROTATE}deg) rotateZ(${s * 360}deg);transform-origin:50% 50%;`;
		});
	});
	return () => {
		d3.select(".background-img").remove();
		timer.stop();
	};
}

function getTransformMatrixOfElement(selector: string) {
	let dom = d3.select(selector).node() as any;
	const transformStr = getComputedStyle(dom).transform;
	let matchRes = transformStr.match(/matrix3d\((.*)\)/);
	let mat4 = identity() as any;
	if (matchRes) {
		mat4 = matchRes[1].split(",").map((i) => Number(i));
	}
	return mat4;
}

function makePlaceLabel(
	svgRoot: SVG,
	animation: boolean,
	decodedShp: DecodedShp,
	getter: { onClick: (i: number, feature: Feature) => void }
) {
	let WIDTH = 107.78;
	let HEIGHT = 56.59;
	let SCALE = 0.5;
	const { geojson, projection } = decodedShp;
	let mat4 = getTransformMatrixOfElement(".base-map-container");
	svgRoot
		.selectAll("g.place-label")
		.data(geojson.features)
		.enter()
		.append("g")
		.attr("class", "place-label")
		.html(function (data: any, index, group) {
			if (data.properties.isBlue) {
				return makeVilliageByColor(data.properties["乡"], "blue");
			} else {
				return makeVilliageByColor(data.properties["乡"], "orange");
			}
		} as any)
		.attr("style", function (data: any) {
			let center = d3.geoCentroid(data);
			center = projection(center);
			data.properties.center = center;
			let { x, y } = getTranslateByScale(center[0], center[1], WIDTH, HEIGHT, 0.5, 1, SCALE);
			return `cursor:pointer;transform:translate(${x}px, ${y}px) scale(${SCALE});`;
		})
		.on("click", function (i, d) {
			getter.onClick(i, d as any);
		});
	let timer;

	if (animation) {
		//添加动画
		const scale = d3.scaleLinear();
		scale.domain([0, 1000, 2000]).range([0, 1, 0]);
		timer = d3.timer(function (elapsed) {
			const t = elapsed % 2000;
			let s = scale(t);
			d3.selectAll(".svg-place-animation-group").attr("style", function (data: any) {
				return `cursor:pointer;transform:translateY(${s * 10}px);`;
			});
		});
	}
	return () => {
		d3.selectAll("g.place-label").remove();
		timer?.stop();
	};
}
let testData3;
function makeSphere(svgRoot: SVG, decodedShp: DecodedShp) {
	return d3
		.json("https://raw.githubusercontent.com/" + "epistler999/GeoLocation/master/world.json")
		.then(function (data: any) {
			testData3 = data;
			// Draw the map
			svgRoot
				.append("g")
				.attr("id", "svg-shpere")
				.selectAll("path")
				.data(data.features)
				.enter()
				.append("path")
				.attr("fill", "green")
				.attr("d", decodedShp.geoPath as any)
				.style("stroke", "#ffff");
		});
}
function makeBaseMap(svgRoot: SVG, level: number, decodedShp) {
	const { geojson, outlineFeature, geoPath } = decodedShp;
	const START_OPACITY = 0.01;
	const END_OPACITY = 0.3;
	const generateOpacity = d3.interpolate(START_OPACITY, END_OPACITY);
	const levelList = makeRange(1, level).map((t) => {
		let res: any = {
			num: t,
			features: [],
		};
		if (t === level) {
			res.features = geojson.features;
		} else {
			res.features = [outlineFeature];
		}
		res.features.forEach((f) => {
			f.properties.path = geoPath;
		});
		return res;
	});
	svgRoot
		.append("g")
		.attr("class", "base-map-container")
		// .style('transform', `rotateX(${ROTATE}deg)`)

		// .attr("style", `transform:rotateX(${ROTATE}deg);`)
		.selectAll("g")
		.data(levelList)
		.enter()
		.append("g")
		.attr("id", function (_level, index) {
			return `base-map-id-${index + 1}`;
		})
		.attr("class", "base-map")
		.attr("style", function (data, index, selection) {
			let opacity;
			if (index === level - 1) {
				opacity = 1;
			} else {
				opacity = generateOpacity((index + 1) / level);
			}
			return `stroke-opacity:${opacity};fill-opacity:${opacity};`;
		})
		.attr("transform", function (data, index, selection) {
			return `translate(0 ${30 * (level - index - 1)})`;
		})
		.selectAll("g")
		.data(function (levelData, index) {
			return levelData.features;
		})
		.enter()
		.append("g")
		.attr("class", "xiangzhen-group")
		.append("path")
		.attr("stroke", "#16ecff")
		.attr("stroke-width", "4")
		.attr("d", decodedShp.geoPath as any)
		.attr("fill", "#051d28");
	return () => {
		d3.select(".base-map-container").remove();
	};
}

function makeRange(min: number, max: number) {
	let res: number[] = [];
	for (let i = min; i <= max; i++) {
		res.push(i);
	}
	return res;
}

function getGeometryOfFeature(feature) {
	let p;
	if (feature.geometry.type === "Polygon") {
		p = turf.polygon(feature.geometry.coordinates);
	} else {
		p = turf.multiPolygon(feature.geometry.coordinates);
	}
	return p;
}

/**
 *
 * @param geojson
 * @returns 多个polygon或multiPolygon的外轮廓
 */
function getOutlineOfGeojson(geojson: GeoJson) {
	const resFeature = geojson.features.reduce(function (res, feature) {
		let p = getGeometryOfFeature(feature);
		return turf.union(res, p);
	} as any);
	//点的顺序造成polygon范围覆盖了全球
	return turf.rewind(resFeature, { reverse: true });
}
function getTranslateByScale(x, y, width, height, originX, originY, scale = 1) {
	let w = width * originX * -1;
	let h = height * originY * -1;
	let nx = x + scale + w;
	let ny = y + scale * h;
	return {
		x: nx,
		y: ny,
	};
}
