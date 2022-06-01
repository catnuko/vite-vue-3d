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
define(["exports","./Check-be2d5acb","./when-ad3237a0","./Math-5ca9b250"],function(e,d,l,i){"use strict";var p=i.CesiumMath.EPSILON10;e.arrayRemoveDuplicates=function(e,d,i,n){if(l.defined(e)){i=l.defaultValue(i,!1);var a=l.defined(n),f=e.length;if(f<2)return e;for(var t,r,u=e[0],s=0,c=-1,h=1;h<f;++h)d(u,t=e[h],p)?(l.defined(r)||(r=e.slice(0,h),s=h-1,c=0),a&&n.push(h)):(l.defined(r)&&(r.push(t),s=h,a&&(c=n.length)),u=t);return i&&d(e[0],e[f-1],p)&&(a&&(l.defined(r)?n.splice(c,0,s):n.push(f-1)),l.defined(r)?--r.length:r=e.slice(0,-1)),l.defined(r)?r:e}}});
