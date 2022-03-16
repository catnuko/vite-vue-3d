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
define(["./when-ad3237a0","./Transforms-1142ce48","./Cartesian2-08065eec","./Check-be2d5acb","./ComponentDatatype-a867ddaa","./GeometryAttribute-da891979","./GeometryAttributes-27dc652d","./Math-5ca9b250","./combine-1510933d","./RuntimeError-767bd866","./WebGLConstants-1c8239cc"],function(r,a,i,e,o,c,u,t,n,s,y){"use strict";function d(){this._workerName="createPlaneOutlineGeometry"}d.packedLength=0,d.pack=function(e,t){return t},d.unpack=function(e,t,n){return r.defined(n)?n:new d};var m=new i.Cartesian3(-.5,-.5,0),p=new i.Cartesian3(.5,.5,0);return d.createGeometry=function(){var e=new u.GeometryAttributes,t=new Uint16Array(8),n=new Float64Array(12);return n[0]=m.x,n[1]=m.y,n[2]=m.z,n[3]=p.x,n[4]=m.y,n[5]=m.z,n[6]=p.x,n[7]=p.y,n[8]=m.z,n[9]=m.x,n[10]=p.y,n[11]=m.z,e.position=new c.GeometryAttribute({componentDatatype:o.ComponentDatatype.DOUBLE,componentsPerAttribute:3,values:n}),t[0]=0,t[1]=1,t[2]=1,t[3]=2,t[4]=2,t[5]=3,t[6]=3,t[7]=0,new c.Geometry({attributes:e,indices:t,primitiveType:c.PrimitiveType.LINES,boundingSphere:new a.BoundingSphere(i.Cartesian3.ZERO,Math.sqrt(2))})},function(e,t){return r.defined(t)&&(e=d.unpack(e,t)),d.createGeometry(e)}});
