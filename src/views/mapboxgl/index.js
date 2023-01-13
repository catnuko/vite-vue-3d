mapboxgl.accessToken =
  "pk.eyJ1Ijoicm9ibGFicyIsImEiOiJwVlg0cnZnIn0.yhekddtKwZohGoORaWjqIw";
 var vecUrlw = "http://t0.tianditu.com/vec_w/wmts?tk=7a801d6cd03da3cc229d90a6c8897e2a";
 var tdtVecw = {
     //类型为栅格瓦片
     "type": "raster",
     'tiles': [
         //请求地址
         vecUrlw + "&SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=vec&STYLE=default&TILEMATRIXSET=w&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&FORMAT=tiles"
     ],
     //分辨率
     'tileSize': 256
 };
var map = new mapboxgl.Map({
  container: "map", // container id
  center: [119.97, 30.53], // starting position [lng, lat]
  projection: 'globe',
  zoom: 15 ,// starting zoom
  style: {
    //设置版本号，一定要设置
    "version": 8,
    //添加来源
    "sources": {
        "tdtVecw": tdtVecw,
        "deqing":{
          type: "raster",
          tiles: [
            "https://zhski.deqing.gov.cn/arcgisrest/ZTXT_yingxiangditu_3857-20190401-arcgisrest/9a9ee64f-a77e-4311-a363-26b9a515a747/WMTS?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=2019_TY_yingxiang4m_20200115_3857_A&STYLE=default&TILEMATRIXSET=default028mm&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&FORMAT=tiles",
          ],
          tileSize: 256,
          zoomOffset: -1
        },
    },
    "layers": [
         {
             "id": "tdtVecw",
             "type": "raster",
             "source": "tdtVecw",
             "minzoom": 0,
             "maxzoom": 17
         },
         {
          id: "deqing",
          type: "raster",
          source:"deqing" ,
          minzoom:0, 
          maxzoom:22,
         },
    ],
},
});