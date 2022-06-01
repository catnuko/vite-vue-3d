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
define(["exports","./when-60b00257","./Check-4274a1fd","./Math-9d37f659","./Cartesian2-2951f601","./Transforms-53ff6d12","./GeometryAttribute-2f728681"],function(t,d,n,X,Y,a,l){"use strict";var w=Math.cos,M=Math.sin,m=Math.sqrt,r={computePosition:function(t,n,a,r,e,o,s){var i=n.radiiSquared,g=t.nwCorner,h=t.boundingRectangle,u=g.latitude-t.granYCos*r+e*t.granXSin,C=w(u),c=M(u),l=i.z*c,S=g.longitude+r*t.granYSin+e*t.granXCos,n=C*w(S),g=C*M(S),C=i.x*n,i=i.y*g,c=m(C*n+i*g+l*c);o.x=C/c,o.y=i/c,o.z=l/c,a&&(a=t.stNwCorner,d.defined(a)?(u=a.latitude-t.stGranYCos*r+e*t.stGranXSin,S=a.longitude+r*t.stGranYSin+e*t.stGranXCos,s.x=(S-t.stWest)*t.lonScalar,s.y=(u-t.stSouth)*t.latScalar):(s.x=(S-h.west)*t.lonScalar,s.y=(u-h.south)*t.latScalar))}},S=new l.Matrix2,f=new Y.Cartesian3,p=new Y.Cartographic,G=new Y.Cartesian3,x=new a.GeographicProjection;function R(t,n,a,r,e,o,s){var i=Math.cos(n),g=r*i,h=a*i,u=Math.sin(n),C=r*u,c=a*u;f=x.project(t,f),f=Y.Cartesian3.subtract(f,G,f);i=l.Matrix2.fromRotation(n,S);f=l.Matrix2.multiplyByVector(i,f,f),f=Y.Cartesian3.add(f,G,f),--o,--s;r=(t=x.unproject(f,t)).latitude,a=r+o*c,u=r-g*s,n=r-g*s+o*c,i=Math.max(r,a,u,n),r=Math.min(r,a,u,n),a=t.longitude,u=a+o*h,n=a+s*C,o=a+s*C+o*h;return{north:i,south:r,east:Math.max(a,u,n,o),west:Math.min(a,u,n,o),granYCos:g,granYSin:C,granXCos:h,granXSin:c,nwCorner:t}}r.computeOptions=function(t,n,a,r,e,o,s){var i=t.east,g=t.west,h=t.north,u=t.south,C=!1,c=!1;h===X.CesiumMath.PI_OVER_TWO&&(C=!0),u===-X.CesiumMath.PI_OVER_TWO&&(c=!0);var l,S=h-u,d=(w=i<g?X.CesiumMath.TWO_PI-g+i:i-g)/((l=Math.ceil(w/n)+1)-1),w=S/((M=Math.ceil(S/n)+1)-1),S=Y.Rectangle.northwest(t,o),n=Y.Rectangle.center(t,p);0===a&&0===r||(n.longitude<S.longitude&&(n.longitude+=X.CesiumMath.TWO_PI),G=x.project(n,G));var M,o=w,n=d,e=Y.Rectangle.clone(t,e),c={granYCos:o,granYSin:0,granXCos:n,granXSin:0,nwCorner:S,boundingRectangle:e,width:l,height:M,northCap:C,southCap:c};return 0!==a&&(h=(S=R(S,a,d,w,0,l,M)).north,u=S.south,i=S.east,g=S.west,c.granYCos=S.granYCos,c.granYSin=S.granYSin,c.granXCos=S.granXCos,c.granXSin=S.granXSin,e.north=h,e.south=u,e.east=i,e.west=g),0!==r&&(a-=r,M=R(s=Y.Rectangle.northwest(e,s),a,d,w,0,l,M),c.stGranYCos=M.granYCos,c.stGranXCos=M.granXCos,c.stGranYSin=M.granYSin,c.stGranXSin=M.granXSin,c.stNwCorner=s,c.stWest=M.west,c.stSouth=M.south),c},t.RectangleGeometryLibrary=r});
