/**
 * Cesium - https://github.com/CesiumGS/cesium
 *
 * Copyright 2011-2020 Cesium Contributors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * Columbus View (Pat. Pend.)
 *
 * Portions licensed separately.
 * See https://github.com/CesiumGS/cesium/blob/main/LICENSE.md for full licensing details.
 */
define(["./AttributeCompression-9fbb8447","./Cartesian2-08065eec","./Math-5ca9b250","./createTaskProcessorWorker","./Check-be2d5acb","./when-ad3237a0"],function(C,d,g,a,e,r){"use strict";var w=32767,k=new d.Cartographic,v=new d.Cartesian3,y=new d.Rectangle,A=new d.Ellipsoid,M={min:void 0,max:void 0};return a(function(a,e){var r=new Uint16Array(a.positions);!function(a){a=new Float64Array(a);var e=0;M.min=a[e++],M.max=a[e++],d.Rectangle.unpack(a,2,y),e+=d.Rectangle.packedLength,d.Ellipsoid.unpack(a,e,A)}(a.packedBuffer);var t=y,n=A,i=M.min,s=M.max,o=r.length/3,c=r.subarray(0,o),u=r.subarray(o,2*o),p=r.subarray(2*o,3*o);C.AttributeCompression.zigZagDeltaDecode(c,u,p);for(var h=new Float64Array(r.length),l=0;l<o;++l){var f=c[l],b=u[l],m=p[l],f=g.CesiumMath.lerp(t.west,t.east,f/w),b=g.CesiumMath.lerp(t.south,t.north,b/w),m=g.CesiumMath.lerp(i,s,m/w),m=d.Cartographic.fromRadians(f,b,m,k),m=n.cartographicToCartesian(m,v);d.Cartesian3.pack(m,h,3*l)}return e.push(h.buffer),{positions:h.buffer}})});
