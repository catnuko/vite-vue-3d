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
define(["./when-ad3237a0","./Cartesian2-08065eec","./Check-be2d5acb","./EllipsoidOutlineGeometry-2e46db09","./Math-5ca9b250","./GeometryOffsetAttribute-03006e80","./Transforms-1142ce48","./combine-1510933d","./RuntimeError-767bd866","./ComponentDatatype-a867ddaa","./WebGLConstants-1c8239cc","./GeometryAttribute-da891979","./GeometryAttributes-27dc652d","./IndexDatatype-9504f550"],function(n,r,e,o,i,t,s,a,d,l,c,u,m,p){"use strict";function y(e){var i=n.defaultValue(e.radius,1),e={radii:new r.Cartesian3(i,i,i),stackPartitions:e.stackPartitions,slicePartitions:e.slicePartitions,subdivisions:e.subdivisions};this._ellipsoidGeometry=new o.EllipsoidOutlineGeometry(e),this._workerName="createSphereOutlineGeometry"}y.packedLength=o.EllipsoidOutlineGeometry.packedLength,y.pack=function(e,i,t){return o.EllipsoidOutlineGeometry.pack(e._ellipsoidGeometry,i,t)};var G=new o.EllipsoidOutlineGeometry,b={radius:void 0,radii:new r.Cartesian3,stackPartitions:void 0,slicePartitions:void 0,subdivisions:void 0};return y.unpack=function(e,i,t){i=o.EllipsoidOutlineGeometry.unpack(e,i,G);return b.stackPartitions=i._stackPartitions,b.slicePartitions=i._slicePartitions,b.subdivisions=i._subdivisions,n.defined(t)?(r.Cartesian3.clone(i._radii,b.radii),t._ellipsoidGeometry=new o.EllipsoidOutlineGeometry(b),t):(b.radius=i._radii.x,new y(b))},y.createGeometry=function(e){return o.EllipsoidOutlineGeometry.createGeometry(e._ellipsoidGeometry)},function(e,i){return n.defined(i)&&(e=y.unpack(e,i)),y.createGeometry(e)}});
