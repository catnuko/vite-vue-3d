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
define(["exports","./Math-5ca9b250"],function(r,d){"use strict";var t={computePositions:function(r,t,a,e,i){for(var n=.5*r,o=-n,r=e+e,s=new Float64Array(3*(i?2*r:r)),c=0,u=0,f=i?3*r:0,h=i?3*(r+e):3*e,y=0;y<e;y++){var M=y/e*d.CesiumMath.TWO_PI,m=Math.cos(M),v=Math.sin(M),b=m*a,M=v*a,m=m*t,v=v*t;s[u+f]=b,s[u+f+1]=M,s[u+f+2]=o,s[u+h]=m,s[u+h+1]=v,s[u+h+2]=n,u+=3,i&&(s[c++]=b,s[c++]=M,s[c++]=o,s[c++]=m,s[c++]=v,s[c++]=n)}return s}};r.CylinderGeometryLibrary=t});
