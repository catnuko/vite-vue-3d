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
define(["./Cartesian2-08065eec","./when-ad3237a0","./EllipseOutlineGeometry-df33fba6","./Check-be2d5acb","./Math-5ca9b250","./GeometryOffsetAttribute-03006e80","./Transforms-1142ce48","./combine-1510933d","./RuntimeError-767bd866","./ComponentDatatype-a867ddaa","./WebGLConstants-1c8239cc","./EllipseGeometryLibrary-002b2f96","./GeometryAttribute-da891979","./GeometryAttributes-27dc652d","./IndexDatatype-9504f550"],function(r,n,i,e,t,a,o,c,l,d,s,u,b,m,f){"use strict";return function(e,t){return(e=n.defined(t)?i.EllipseOutlineGeometry.unpack(e,t):e)._center=r.Cartesian3.clone(e._center),e._ellipsoid=r.Ellipsoid.clone(e._ellipsoid),i.EllipseOutlineGeometry.createGeometry(e)}});
