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
define(["exports","./when-ad3237a0"],function(e,s){"use strict";e.combine=function e(n,r,t){t=s.defaultValue(t,!1);var o,f,i,a={},d=s.defined(n),p=s.defined(r);if(d)for(o in n)n.hasOwnProperty(o)&&(f=n[o],p&&t&&"object"==typeof f&&r.hasOwnProperty(o)?(i=r[o],a[o]="object"==typeof i?e(f,i,t):f):a[o]=f);if(p)for(o in r)r.hasOwnProperty(o)&&!a.hasOwnProperty(o)&&(i=r[o],a[o]=i);return a}});
