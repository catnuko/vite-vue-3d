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
define(["exports","./Check-be2d5acb","./when-ad3237a0"],function(e,t,l){"use strict";var a=Object.freeze({NONE:0,TOP:1,ALL:2});e.GeometryOffsetAttribute=a,e.arrayFill=function(e,t,a,f){if("function"==typeof e.fill)return e.fill(t,a,f);for(var r=e.length>>>0,n=(a=l.defaultValue(a,0))<0?Math.max(r+a,0):Math.min(a,r),i=(f=l.defaultValue(f,r))<0?Math.max(r+f,0):Math.min(f,r);n<i;)e[n]=t,n++;return e}});
