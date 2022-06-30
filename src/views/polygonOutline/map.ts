import axios from 'axios'
import * as turf from '@turf/turf'
// export async function show() {
//     let url = "./data/geojson/行政区_乡镇.geojson"
//     let res = await axios.get(url)
//     let geojson = res.data
//     let outline = geojson.features[0]
//     // console.log(outline)
//     for (let i = 1; i < geojson.features.length; i++) {
//         let feature = geojson.features[i]
//         if (feature.geometry.coordinates.length >= 4) {
//             outline = turf.union(outline, feature)
//         }
//     }
//     console.log(outline)
// }
export async function show() {
    let url = "./data/geojson/行政区_村.geojson"
    let res = await axios.get(url)
    let geojson = res.data
    let outline = geojson.features[0]
    // console.log(outline)
    let xiangZhenList = {}
    for (let i = 0; i < geojson.features.length; i++) {
        let feature = geojson.features[i]
        let p = feature.properties
        let xiangZhenName = p["权属名称"]
        let list = xiangZhenList[xiangZhenName]
        if (!list) {
            list = []
            xiangZhenList[xiangZhenName] = list
        }
        list.push(feature)
    }
    for (let key in xiangZhenList) {
        let outline = xiangZhenList[key][0]
        for (let i = 0; i < geojson.features.length; i++) {
            let feature = geojson.features[i]
            if (feature.geometry.coordinates.length >= 4) {
                outline = turf.union(outline, feature)
            }
        }
        console.log(key)
        console.log(JSON.stringify(outline))
    }
}