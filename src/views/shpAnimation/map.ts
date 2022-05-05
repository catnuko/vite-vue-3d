import * as d3 from "d3";
import {Selection} from "d3";
import {FeatureCollection, Polygon, Feature as $Feature} from "geojson";
import * as turf from "@turf/turf";
import {MultiPolygon} from "@turf/turf";
import {outlineGeojson} from './f'
import {geoNaturalEarth1, geoTransverseMercator} from "d3-geo";
import {transformDirection, transformPoint, identity, xRotate, xRotation} from './math'
import {makeVilliageByColor, makeVilliage, getCurrentPlaceLabel} from './svg'
import mitt from 'mitt'

type Geometry = Polygon | MultiPolygon
type SVG = Selection<SVGSVGElement, unknown, HTMLElement, any>;
type GeoJson = FeatureCollection<Geometry>;
type Properties = {
    center: any,
    path: any,
    isBlue: boolean,
    乡: string
    县: string
    市: string
    省: string
}
type Feature<P = Properties> = $Feature<Geometry, P>
type Bounds = [[number, number], [number, number]]

export interface MapConfig {
    town: string
    avaliableVillageList: string[],
    showVillage: {
        name: string,
        enName: string,
        position: [number, number]
    }
}

export interface DecodedShp {
    geojson: GeoJson,
    outlineFeature: Feature,
    geoPath: d3.GeoPath,
    projection: d3.GeoProjection,
    bounds: Bounds
}

const EVENT = {
    LABEL_CLICK: "LABEL_CLICK",
}

/**
 * 中文乱码解决方式，修改shp.js源文件，搜索替换下面语句
 * var decoder = createDecoder(encoding||"gbk");
 */
const SHP_FILE_PATH = "./data/乐清市街道.zip";
const LEVEL = 5
const ROTATE = 30
const MAX_NUM = 2
const MIN_LINE_HEIGHT = 40
const MAX_LINE_HEIGHT = 100
const ICON_WIDTH = 179.64
const ICON_HEIGHT = 94.31
const mapConfig: MapConfig = {
    town: "柳市镇",
    avaliableVillageList: [],
    showVillage: {
        name: "黄花村",
        enName: "HUANG HUA CUN",
        position: [120.93491643062, 28.002968757927],
    },
}
let mitter = mitt()

export async function main(id: string) {
    const svg = makeSvg(id)
    const {width, height} = getSizeOfSvg(svg)
    const geojson = await shp(SHP_FILE_PATH);
    const decodedShp = processShp(geojson, width, height)
    initRenderData(decodedShp, mapConfig)
    console.log(decodedShp)
    let removeTownLayer = makeTownLayer(svg, decodedShp, mapConfig)
    return {
        dstroy() {
            removeTownLayer && removeTownLayer()
            svg.remove()
        },
        on: mitter.on.bind(mitter),
        off: mitter.off.bind(mitter),
        EVENT:EVENT,
        switchLayer(feature) {
            removeTownLayer && removeTownLayer()
            removeTownLayer = makeVillageLayer(svg, decodedShp, mapConfig, feature)
        }
    }
}

export function initRenderData(decodedShp: DecodedShp, mapConfig: MapConfig) {
    decodedShp.geojson.features.forEach(f => {
        if (f.properties.乡 === mapConfig.town) {
            f.properties.isBlue = true
        }
    })
}

function makeTownLayer(svg: SVG, decodedShp: DecodedShp, mapConfig: MapConfig) {
    let removeCurrentPlaceLabel
    let removeGgImg = makeBgImg(svg)
    let removeBaseMap = makeBaseMap(svg, LEVEL, decodedShp)
    let removePlaceLabel = makePlaceLabel(svg, LEVEL, true, decodedShp, {
        onClick(i, data) {
            let town = data.properties['乡']
            mitter.emit(EVENT.LABEL_CLICK, data)
            if (mapConfig.town === town) {
                removeBaseMap()
                removePlaceLabel()
                removeFlyLine()
                const {width, height} = getSizeOfSvg(svg)
                let geojson = {
                    type: "FeatureCollection",
                    features: [data]
                }
                const villageDecodedShp = processShp(geojson, width, height, data)
                removeBaseMap = makeBaseMap(svg, LEVEL, villageDecodedShp)
                removePlaceLabel = makePlaceLabel(svg, LEVEL, true, decodedShp, {
                    onClick(i, data) {
                        console.log(data, mapConfig.showVillage)
                    }
                })
                removeCurrentPlaceLabel = makeCurrentPlaceLabel(svg, decodedShp)
                removeFlyLine = makeFlyLine(svg, villageDecodedShp.bounds)
            } else {
                console.error("点错了", data)
            }
        }
    })
    let removeFlyLine = makeFlyLine(svg, decodedShp.bounds)
    return () => {
        removeGgImg()
        removeBaseMap()
        removePlaceLabel()
        removeFlyLine()
        removeCurrentPlaceLabel && removeCurrentPlaceLabel()
    }
}

function makeVillageLayer(svg: SVG, decodedShp: DecodedShp, mapConfig: MapConfig, feature: Feature) {
    const {width, height} = getSizeOfSvg(svg)
    let geojson = {
        type: "FeatureCollection",
        features: [feature]
    }
    const villageDecodedShp = processShp(geojson, width, height, feature)
    let removeGgImg = makeBgImg(svg)
    let removeBaseMap = makeBaseMap(svg, LEVEL, villageDecodedShp)
    let removePlaceLabel = makePlaceLabel(svg, LEVEL, true, decodedShp, {
        onClick(i, data) {
            console.log(data, mapConfig.showVillage)
        }
    })
    let removeCurrentPlaceLabel = makeCurrentPlaceLabel(svg, decodedShp)
    let removeFlyLine = makeFlyLine(svg, villageDecodedShp.bounds)
    return () => {
        removeGgImg()
        removeBaseMap()
        removePlaceLabel()
        removeFlyLine()
        removeCurrentPlaceLabel()
    }
}

function processShp(geojson, width, height, outlineFeature?: Feature): DecodedShp {
    let innerOutlineFeature = outlineFeature
    if (!outlineFeature) {
        innerOutlineFeature = getOutlineOfGeojson(geojson)
    }
    const geoPath = makeGeoPath(width, height, geojson)
    const bounds = geoPath.bounds(geojson)
    return {geojson, outlineFeature: innerOutlineFeature, geoPath, bounds, projection: geoPath.projection()}
}

function makeGeoPath(width, height, geojson: GeoJson) {
    const projection = d3.geoMercator().fitSize([width, height], geojson);
    return d3.geoPath(projection)
}

function makeSvg(id: string) {
    const container = document.getElementById(id);
    const width = container.clientWidth;
    const height = container.clientHeight;
    const svg = d3
        .select(`#${id}`)
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .attr("style", "background-color:#38607f;");
    return svg
}

function getSizeOfSvg(svg: SVG) {
    return {
        width: Number(svg.attr('width')),
        height: Number(svg.attr("height"))
    }
}

function makeCurrentPlaceLabel(svg: SVG, decodedShp: DecodedShp) {
    let WIDTH = 178
    let HEIGHT = 217
    let x = 1000
    let y = 500
    let mat4 = getTransformMatrixOfElement('.base-map-container')
    let html = getCurrentPlaceLabel(x, y, 1, mapConfig.showVillage.name, mapConfig.showVillage.enName)
    svg
        .append("g")
        .html(html)
        .attr('class', 'current-place-label')
        .attr("style", function (data) {
            let center = [x, y]
            center[0] -= WIDTH / 2
            center[1] -= HEIGHT
            center.push(0)
            center = transformPoint(mat4, center)
            return `cursor:pointer;transform:translate(${center[0]}px, ${center[1]}px) scale(0.6);`;
        })
        .on("click", function (data) {
            mitter.emit(EVENT.LABEL_CLICK, data)
        })
    return () => {
        d3.select(".current-place-label").remove()
    }
}

function makeBgGrid(svg: SVG, projection: d3.GeoProjection) {
    const gridGenerator = d3.geoGraticule()
    const path = d3.geoPath(projection)
    svg.append('g')
        .attr('class', 'grid')
        .append('path')
        .datum(gridGenerator)
        .attr('class', 'graticule')
        .attr('d', path)
        .attr('stroke-width', '1px')
        .attr('stroke', 'red')
}


function makeFlyLine(svg: SVG, bounds: Bounds) {
    const data = makeRange(0, MAX_NUM).map(x => ({
        num: 1,
        x1: 0,
        y1: 0,
        x2: 0,
        y2: 0,
        height: 0,
        time: 0
    }))
    const width = bounds[1][0] - bounds[0][0]
    const height = bounds[1][1] - bounds[0][1]
    const xRandom = d3.randomUniform(bounds[0][0], bounds[1][0])
    const yRandom = d3.randomUniform(bounds[0][1], bounds[1][1])
    const heightRandom = d3.randomUniform(MIN_LINE_HEIGHT, MAX_LINE_HEIGHT)
    const scale = d3.scaleLinear().domain([MIN_LINE_HEIGHT, MAX_LINE_HEIGHT]).range([4, 6])
    const container = svg.append('g')
        .attr("class", 'flyline-container')
        .attr("width", width)
        .attr("height", height)
        .selectAll("line")
        .data(data)
        .enter()
    const line = container.append('line')
        .attr("stroke", function (data, index) {
            return `url(#flyline-symbol-${index})`
        })
        .attr("stroke-width", 4)
        .attr("stroke-opacity", 1)
        .attr('x1', function (data, index) {
            data.x1 = xRandom()
            return data.x1
        })
        .attr('y1', function (data, index) {
            data.y1 = yRandom()
            return data.y1
        })
        .attr('x2', function (data, index) {
            data.x2 = data.x1
            return data.x2
        })
        .attr('y2', function (data, index) {
            data.height = heightRandom()
            data.time = scale(data.height)
            data.y2 = data.y1 - data.height
            return data.y2
        })
    container.append('defs')
        .append('linearGradient')
        .attr('id', function (data, index) {
            return `flyline-symbol-${index}`
        })
        .attr('x1', function (data, index) {
            return data.x1 + 0.5000
        })
        .attr('y1', function (data, index) {
            return data.y2
        })
        .attr('x2', function (data, index) {
            return data.x2 + 0.5000
        })
        .attr('y2', function (data, index) {
            return data.y1 + 0.5
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
    <stop offset="1" stop-color="#214662" stop-opacity="0"/>`
        })
    line
        .append("animate")
        .attr("attributeName", 'y2')
        .attr("attributeType", 'XML')
        .attr("begin", '0s')
        .attr("dur", function (data) {
            return `${data.time}s`
        })
        .attr("repeatCount", 'indefinite')
        .attr("values", function (data) {
            return `${data.y1}; ${data.y1 + 20 - data.height};${data.y2}`
        })
    line
        .append("animate")
        .attr("attributeName", 'y1')
        .attr("attributeType", 'XML')
        .attr("begin", '0s')
        .attr("dur", function (data) {
            return `${data.time}s`
        })
        .attr("repeatCount", 'indefinite')
        .attr("values", function (data) {
            return `${data.y1}; ${data.y1 - 1};${data.y2}`
        })
    return () => {
        d3.select('.flyline-container').remove()
    }
}

function makeBgImg(svg: SVG) {
    const {width, height} = getSizeOfSvg(svg)
    const DURATION = 15 * 1000
    svg
        .append('image')
        .attr("class", 'background-img')
        .attr('width', width)
        .attr('height', height)
        .attr("xlink:href", new URL("./login-ani-bg.png", import.meta.url).href)
    const scale = d3.scaleLinear();
    scale.domain([0, DURATION])
        .range([0, 1])
    let timer = d3.timer(function (elapsed) {
        const t = elapsed % DURATION
        let s = scale(t);
        d3.select(".background-img")
            .attr("style", function () {
                return `transform:rotateX(${ROTATE}deg) rotateZ(${s * 360}deg);transform-origin:50% 50%;`;
            })
    })
    return () => {
        d3.select(".background-img").remove()
        timer.stop()
    }
}

function getTransformMatrixOfElement(selector: string) {
    let dom = d3.select(selector).node()
    const transformStr = getComputedStyle(dom).transform
    let matchRes = transformStr.match(/matrix3d\((.*)\)/)
    let mat4 = identity()
    if (matchRes) {
        mat4 = matchRes[1].split(",").map(i => Number(i))
    }
    return mat4
}

function makePlaceLabel(svg: SVG, level: number, animation: boolean, decodedShp: DecodedShp, getter: { onClick: (i: number, feature: Feature) => void }) {
    const {geojson, projection} = decodedShp
    let mat4 = getTransformMatrixOfElement('.base-map-container')
    svg
        .selectAll("g.place-label")
        .data(geojson.features)
        .enter()
        .append("g")
        .attr("class", 'place-label')
        .html(function (data, index, group) {
            if (data.properties.isBlue) {
                return makeVilliageByColor(data.properties["乡"], 'blue');
            } else {
                return makeVilliageByColor(data.properties["乡"], 'orange');
            }
        })
        .attr("style", function (data) {
            let pointFeature = turf.center(data);
            let center = projection(pointFeature.geometry.coordinates as any)
            center[0] -= ICON_WIDTH / 2
            center[1] -= ICON_HEIGHT
            center.push(0)
            center = transformPoint(mat4, center)
            data.properties.center = center
            return `cursor:pointer;transform:translate(${center[0]}px, ${center[1]}px) scale(0.6);`;
        })
        .on("click", function (i, d) {
            getter.onClick(i, d)
        })
    let timer
    if (animation) {
        //添加动画
        const scale = d3.scaleLinear();
        scale.domain([0, 1000, 2000])
            .range([0, 1, 0])
        timer = d3.timer(function (elapsed) {
            const t = elapsed % 2000
            let s = scale(t);
            d3.selectAll(".place-label")
                .attr("style", function (data) {
                    const center = data.properties.center
                    return `cursor:pointer;transform:translate(${center[0]}px, ${center[1] + s * 10}px) scale(0.6);`;
                })
        });
    }
    return () => {
        d3.selectAll("g.place-label").remove()
        timer?.stop()
    }
}

function makeBaseMap(svg: SVG, level: number, decodedShp) {
    const {geojson, outlineFeature, geoPath} = decodedShp
    const START_OPACITY = 0.01;
    const END_OPACITY = 0.3;
    const generateOpacity = d3.interpolate(START_OPACITY, END_OPACITY);
    const levelList = makeRange(1, level).map(t => {
        let res = {
            num: t,
            features: [],
        }
        if (t === level) {
            res.features = geojson.features
        } else {
            res.features = [outlineFeature]
        }
        res.features.forEach(f => {
            f.properties.path = geoPath
        })
        return res
    })
    svg
        .append("g")
        .attr("class", "base-map-container")
        .attr("style", `transform:rotateX(${ROTATE}deg);`)
        .selectAll("g")
        .data(levelList)
        .enter()
        .append("g")
        .attr("id", function (_level, index) {
            return `base-map-id-${index + 1}`;
        })
        .attr("class", "base-map")
        .attr("style", function (data, index, selection) {
            let opacity
            if (index === level - 1) {
                opacity = 1
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
            return levelData.features
        })
        .enter()
        .append("g")
        .attr("class", "xiangzhen-group")
        .append("path")
        .attr("stroke", "#16ecff")
        .attr("stroke-width", "4")
        .attr("d", function (feature,) {
            return feature.properties.path(feature)
        })
        .attr("fill", "#051d28");
    return () => {
        d3.select(".base-map-container").remove()
    }
}

function makeRange(min, max) {
    let res = [];
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
    const resFeature = geojson.features.reduce((res, feature) => {
        let p = getGeometryOfFeature(feature);
        return turf.union(res, p);
    });
    //点的顺序造成polygon范围覆盖了全球
    return turf.rewind(resFeature, {reverse: true})
}
