import axios from "axios";
import { Coordtransform } from '../helper/coordConvert'
import proj4 from 'proj4'
import { cartesian32LonLat } from "ht-cesium-utils";
export let coordConvert = new Coordtransform()
export function getRoutePath(params) {
    return axios({
        method: 'get',
        url: `https://restapi.amap.com/v5/direction/driving`,
        params
    })
}
export function searchPoi(params) {
    return axios({
        method: 'get',
        url: `https://restapi.amap.com/v5/place/text`,
        params
    })
}
export function searchPoiByText(text, tk) {
    return searchPoi({
        keywords: text,
        key: tk
    }).then(res => {
        if (res.data.infocode === "10000") {
            let target = res.data.pois[0]
            let targetPoint = target.location.split(",")
            return coordConvert.gcj02towgs84(Number(targetPoint[0]), Number(targetPoint[1]))
        }
    })
}
export function cartesian32GaoDeLonLat(cartesian3) {
    let res = cartesian32LonLat(cartesian3)
    return coordConvert.wgs84togcj02(res.lon, res.lat)
}
export function planRouteFromCartesian3ToCartesian3(start, end, mid, tk) {
    return planRouteFromCartesian3(start, end, mid, tk).then(pathList => {
        return pathList.map(path => {
            return {
                ...path,
                polyline: path.polyline.map(point => {
                    return Cesium.Cartesian3.fromDegrees(point[0], point[1])
                })
            }
        })
    })
}
export function planRouteFromCartesian3(start, end, mid, tk) {
    let startP = cartesian32GaoDeLonLat(start)
    let endP = cartesian32GaoDeLonLat(end)
    let midPList
    if (mid) {
        midPList = mid.map(cartesian32GaoDeLonLat)
    }
    return planRoute(startP, endP, midPList, tk)
}
export function planRoute(start, end, mid, tk) {
    return getRoutePath({
        origin: start.join(","),
        destination: end.join(","),
        show_fields: 'polyline,cost',
        key: tk,
        waypoints: mid ? mid.map(x => x.join(",")).join(";") : undefined,
    }).then(res => {
        if (res.data.infocode === "10000") {
            let pathList = res.data.route.paths.map(path => {
                let polyline = path.steps.reduce((total, cur) => {
                    if (total === "") {
                        return cur.polyline
                    } else {
                        total = total + ";" + cur.polyline
                        return total
                    }
                }, "").split(";").map(item => item.split(",").map(x => Number(x))).map(x => {
                    return coordConvert.gcj02towgs84(x[0], x[1])
                })
                return {
                    distance: path.distance,
                    polyline: polyline,
                    cost: path.cost
                }
            })
            return pathList
        } else {
            return []
        }
    })
}
export function cartesianTogcj02(point) {
    let np = cartesian32LonLat(point)
    return cgcs2000Togcj02([np.lon, np.lat])
}
proj4.defs("EPSG:4490", "+proj=longlat +ellps=GRS80 +no_defs +type=crs");
export function cgcs2000Togcj02(point) {
    let np = proj4("EPSG:4490", "EPSG:4326", point)
    return coordConvert.wgs84togcj02(np[0], np[1])
}
export function gcj02Tocgcs2000(point) {
    let np = coordConvert.gcj02towgs84(point[0],point[1])
    return proj4("EPSG:4490", "EPSG:4326", np)
}