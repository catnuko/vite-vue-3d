const axios = require("axios")
console.log("正在请求数据")
axios.get("https://tdzz.pj.gov.cn:10402/geoserver/pj_Data_1/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=pj_Data_1%3Atdzy1_4&maxFeatures=67339&outputFormat=application%2Fjson").then(res => {
    console.log("请求完成")
    const fc = res.data
    let s = new Map()
    fc.features.forEach(f => {
        let p = f.properties
        if (p) {
            s.set(p.DLBM, p.DLMC)
        }
    })
    let list = []
    s.forEach((v, k) => {
        list.push({dlmc: v, dlbm: k})
    })
    console.log(list)
    console.log(JSON.stringify(list))

})
