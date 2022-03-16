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
define(["./when-ad3237a0","./Cartesian2-08065eec","./Check-be2d5acb","./EllipsoidGeometry-3051a04d","./VertexFormat-fc4fc84a","./Math-5ca9b250","./GeometryOffsetAttribute-03006e80","./Transforms-1142ce48","./combine-1510933d","./RuntimeError-767bd866","./ComponentDatatype-a867ddaa","./WebGLConstants-1c8239cc","./GeometryAttribute-da891979","./GeometryAttributes-27dc652d","./IndexDatatype-9504f550"],function(i,a,e,o,n,t,r,s,c,d,l,m,u,p,y){"use strict";function G(e){var t=i.defaultValue(e.radius,1),e={radii:new a.Cartesian3(t,t,t),stackPartitions:e.stackPartitions,slicePartitions:e.slicePartitions,vertexFormat:e.vertexFormat};this._ellipsoidGeometry=new o.EllipsoidGeometry(e),this._workerName="createSphereGeometry"}G.packedLength=o.EllipsoidGeometry.packedLength,G.pack=function(e,t,r){return o.EllipsoidGeometry.pack(e._ellipsoidGeometry,t,r)};var f=new o.EllipsoidGeometry,k={radius:void 0,radii:new a.Cartesian3,vertexFormat:new n.VertexFormat,stackPartitions:void 0,slicePartitions:void 0};return G.unpack=function(e,t,r){t=o.EllipsoidGeometry.unpack(e,t,f);return k.vertexFormat=n.VertexFormat.clone(t._vertexFormat,k.vertexFormat),k.stackPartitions=t._stackPartitions,k.slicePartitions=t._slicePartitions,i.defined(r)?(a.Cartesian3.clone(t._radii,k.radii),r._ellipsoidGeometry=new o.EllipsoidGeometry(k),r):(k.radius=t._radii.x,new G(k))},G.createGeometry=function(e){return o.EllipsoidGeometry.createGeometry(e._ellipsoidGeometry)},function(e,t){return i.defined(t)&&(e=G.unpack(e,t)),G.createGeometry(e)}});
