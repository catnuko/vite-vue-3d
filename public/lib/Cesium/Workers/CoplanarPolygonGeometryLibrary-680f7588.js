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
 * See https://github.com/CesiumGS/cesium/blob/master/LICENSE.md for full licensing details.
 */
define(["exports","./Check-4274a1fd","./Cartesian2-2951f601","./Transforms-53ff6d12","./OrientedBoundingBox-23288f54"],function(n,t,d,g,l){"use strict";var e={},i=new d.Cartesian3,x=new d.Cartesian3,B=new d.Cartesian3,P=new d.Cartesian3,M=new l.OrientedBoundingBox;function o(n,t,e,r,a){t=d.Cartesian3.subtract(n,t,i),e=d.Cartesian3.dot(e,t),t=d.Cartesian3.dot(r,t);return d.Cartesian2.fromElements(e,t,a)}e.validOutline=function(n){var t=l.OrientedBoundingBox.fromPoints(n,M).halfAxes,e=g.Matrix3.getColumn(t,0,x),n=g.Matrix3.getColumn(t,1,B),t=g.Matrix3.getColumn(t,2,P),e=d.Cartesian3.magnitude(e),n=d.Cartesian3.magnitude(n),t=d.Cartesian3.magnitude(t);return!(0===e&&(0===n||0===t)||0===n&&0===t)},e.computeProjectTo2DArguments=function(n,t,e,r){var a,i,o=l.OrientedBoundingBox.fromPoints(n,M),u=o.halfAxes,s=g.Matrix3.getColumn(u,0,x),C=g.Matrix3.getColumn(u,1,B),m=g.Matrix3.getColumn(u,2,P),c=d.Cartesian3.magnitude(s),f=d.Cartesian3.magnitude(C),n=d.Cartesian3.magnitude(m),u=Math.min(c,f,n);return(0!==c||0!==f&&0!==n)&&(0!==f||0!==n)&&(u!==f&&u!==n||(a=s),u===c?a=C:u===n&&(i=C),u!==c&&u!==f||(i=m),d.Cartesian3.normalize(a,e),d.Cartesian3.normalize(i,r),d.Cartesian3.clone(o.center,t),!0)},e.createProjectPointsTo2DFunction=function(r,a,i){return function(n){for(var t=new Array(n.length),e=0;e<n.length;e++)t[e]=o(n[e],r,a,i);return t}},e.createProjectPointTo2DFunction=function(e,r,a){return function(n,t){return o(n,e,r,a,t)}},n.CoplanarPolygonGeometryLibrary=e});
