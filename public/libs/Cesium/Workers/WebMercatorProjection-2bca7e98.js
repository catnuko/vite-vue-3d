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
define(["exports","./Cartesian2-08065eec","./when-ad3237a0","./Check-be2d5acb","./Math-5ca9b250"],function(e,o,r,t,i){"use strict";function n(e){this._ellipsoid=r.defaultValue(e,o.Ellipsoid.WGS84),this._semimajorAxis=this._ellipsoid.maximumRadius,this._oneOverSemimajorAxis=1/this._semimajorAxis}Object.defineProperties(n.prototype,{ellipsoid:{get:function(){return this._ellipsoid}}}),n.mercatorAngleToGeodeticLatitude=function(e){return i.CesiumMath.PI_OVER_TWO-2*Math.atan(Math.exp(-e))},n.geodeticLatitudeToMercatorAngle=function(e){n.MaximumLatitude<e?e=n.MaximumLatitude:e<-n.MaximumLatitude&&(e=-n.MaximumLatitude);e=Math.sin(e);return.5*Math.log((1+e)/(1-e))},n.MaximumLatitude=n.mercatorAngleToGeodeticLatitude(Math.PI),n.prototype.project=function(e,t){var i=this._semimajorAxis,a=e.longitude*i,i=n.geodeticLatitudeToMercatorAngle(e.latitude)*i,e=e.height;return r.defined(t)?(t.x=a,t.y=i,t.z=e,t):new o.Cartesian3(a,i,e)},n.prototype.unproject=function(e,t){var i=this._oneOverSemimajorAxis,a=e.x*i,i=n.mercatorAngleToGeodeticLatitude(e.y*i),e=e.z;return r.defined(t)?(t.longitude=a,t.latitude=i,t.height=e,t):new o.Cartographic(a,i,e)},e.WebMercatorProjection=n});
