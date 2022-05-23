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
define(["exports","./when-60b00257","./Math-9d37f659","./Cartesian2-2951f601","./EllipsoidTangentPlane-f9b097b8","./PolygonPipeline-72c6abb2","./PolylinePipeline-30fab084"],function(e,m,C,A,w,b,E){"use strict";var i={};var O=new A.Cartographic,M=new A.Cartographic;function L(e,i,t,n){var r=i.length;if(!(r<2)){var o=m.defined(n),a=m.defined(t),l=!0,h=new Array(r),s=new Array(r),g=new Array(r),p=i[0];h[0]=p;var P=e.cartesianToCartographic(p,O);a&&(P.height=t[0]),l=l&&P.height<=0,s[0]=P.height,g[0]=o?n[0]:0;for(var d,u,c=1,v=1;v<r;++v){var f=i[v],y=e.cartesianToCartographic(f,M);a&&(y.height=t[v]),l=l&&y.height<=0,d=P,u=y,C.CesiumMath.equalsEpsilon(d.latitude,u.latitude,C.CesiumMath.EPSILON14)&&C.CesiumMath.equalsEpsilon(d.longitude,u.longitude,C.CesiumMath.EPSILON14)?P.height<y.height&&(s[c-1]=y.height):(h[c]=f,s[c]=y.height,g[c]=o?n[v]:0,A.Cartographic.clone(y,P),++c)}if(!(l||c<2))return h.length=c,s.length=c,g.length=c,{positions:h,topHeights:s,bottomHeights:g}}}var F=new Array(2),H=new Array(2),T={positions:void 0,height:void 0,granularity:void 0,ellipsoid:void 0};i.computePositions=function(e,i,t,n,r,o){var a=L(e,i,t,n);if(m.defined(a)){i=a.positions,t=a.topHeights,n=a.bottomHeights,3<=i.length&&(g=w.EllipsoidTangentPlane.fromPoints(i,e).projectPointsOntoPlane(i),b.PolygonPipeline.computeWindingOrder2D(g)===b.WindingOrder.CLOCKWISE&&(i.reverse(),t.reverse(),n.reverse()));var l,h,s=i.length,g=s-2,p=C.CesiumMath.chordLength(r,e.maximumRadius),P=T;if(P.minDistance=p,P.ellipsoid=e,o){for(var d=0,u=0;u<s-1;u++)d+=E.PolylinePipeline.numberOfPoints(i[u],i[u+1],p)+1;l=new Float64Array(3*d),h=new Float64Array(3*d);var c=F,v=H;P.positions=c,P.height=v;var f=0;for(u=0;u<s-1;u++){c[0]=i[u],c[1]=i[u+1],v[0]=t[u],v[1]=t[u+1];var y=E.PolylinePipeline.generateArc(P);l.set(y,f),v[0]=n[u],v[1]=n[u+1],h.set(E.PolylinePipeline.generateArc(P),f),f+=y.length}}else P.positions=i,P.height=t,l=new Float64Array(E.PolylinePipeline.generateArc(P)),P.height=n,h=new Float64Array(E.PolylinePipeline.generateArc(P));return{bottomPositions:h,topPositions:l,numCorners:g}}},e.WallGeometryLibrary=i});
