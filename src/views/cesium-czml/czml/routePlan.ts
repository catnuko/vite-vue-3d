import axios from "axios";
import xmlToJSON from "xmltojson";
import { cartesian32LonLat } from "ht-cesium-utils";
import { getPointResolution } from "ol/proj";
export function setLandIds(viewer, start, end) {
	const tk = "1292dbbb36f799c61eabc3c732eef02c";
	Promise.all([getPlaceLocation(start, tk), getPlaceLocation(end, tk)]).then((placeList) => {
		let start = [placeList[0].lon, placeList[0].lat];
		let end = [placeList[1].lon, placeList[1].lat];
		planRoute(start, end, undefined, tk).then((res) => {
			showPlanRouteResult(viewer, res.data);
		});
	});
}
let lastShowRoute;
export function showPlanRouteResult(viewer, data) {
	if (lastShowRoute) {
		lastShowRoute.forEach((route) => {
			route.entity.routePoint.forEach((e) => viewer.entities.remove(e));
			viewer.entities.remove(route.entity.routePolyline);
			delete route.entity;
		});
		lastShowRoute = null;
	}
	let json = xmlToJSON.parseString(data);
	const routes = json.result;
	showRoutes(viewer, routes);
	lastShowRoute = routes;
}
export function showRoutes(viewer, routes) {
	let entities = [];
	routes.forEach((route) => {
		let ps = route.routelatlon[0]._text;
		ps = ps
			.split(";")
			.flat()
			.join(",")
			.split(",")
			.map((t) => Number(t));
		ps.splice(ps.length - 1, 1);
		const cartesian3List = Cesium.Cartesian3.fromDegreesArray(ps);
		let routePolyline = viewer.entities.add(
			new Cesium.Entity({
				polyline: {
					positions: cartesian3List,
					material: Cesium.Color.fromCssColorString("#ffd766"),
					width: 10,
					clampToGround: true,
				},
			})
		);
		log(cartesian3List);
		let routePoint = cartesian3List.map((cartesian3) => {
			return viewer.entities.add(
				new Cesium.Entity({
					position: cartesian3,
					point: {
						pixelSize: 5,
						color: Cesium.Color.fromCssColorString("#c24034"),
						clampToGround: true,
						distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0.0, 20000.0),
					},
				})
			);
		});
		route.entity = {
			routePolyline,
			routePoint,
		};
		entities = entities.concat(routePoint);
	});
	viewer.flyTo(entities);
}
function log(ps) {
	let res = ps.map((p) => {
		let _p = cartesian32LonLat(p);
		return [_p.lon, _p.lat];
	});
	console.log(JSON.stringify(res));
}
export async function getPlaceLocation(keyword, tk) {
	const res = await geocode(keyword, tk);
	if (res.data.status === "0") {
		const location = res.data.location;
		return location;
	}
}
export function geocode(keyword, tk) {
	return axios({
		url: "https://api.tianditu.gov.cn/geocoder",
		method: "get",
		params: {
			ds: JSON.stringify({
				keyWord: keyword,
			}),
			tk: tk,
		},
	});
}
export function planRoute(start, end, mid, tk) {
	return axios({
		url: "https://api.tianditu.gov.cn/drive",
		method: "get",
		params: {
			postStr: JSON.stringify({
				orig: start.join(","),
				dest: end.join(","),
				mid: mid ? mid.join(",") : undefined,
				style: "0",
			}),
			type: "search",
			tk: tk,
		},
	});
}
export async function getLonlatFromPlace(start, end, tk) {
	const placeList = await Promise.all([getPlaceLocation(start, tk), getPlaceLocation(end, tk)]);
	let _start = [placeList[0].lon, placeList[0].lat];
	let _end = [placeList[1].lon, placeList[1].lat];
	return { start: _start, end: _end };
}
export async function getRouteFromPlace(start, end, tk) {
	const res = await getLonlatFromPlace(start, end, tk);
	return getRouteFromLonlat(res.start, res.end, tk);
}
//start:[lon,lat]
export async function getRouteFromLonlat(start, end, tk) {
	const res = await planRoute(start, end, undefined, tk);
	let json = xmlToJSON.parseString(res.data);
	const routes = json.result;
	return routes.map((route) => {
		let ps = route.routelatlon[0]._text;
		ps = ps
			.split(";")
			.flat()
			.join(",")
			.split(",")
			.map((t) => Number(t));
		ps.splice(ps.length - 1, 1);
		const cartesian3List = Cesium.Cartesian3.fromDegreesArray(ps);
		return {
			cartesian3List,
			raw: route,
		};
	});
}
