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
define(["./PrimitivePipeline-3d68cec1","./createTaskProcessorWorker","./Transforms-1142ce48","./Cartesian2-08065eec","./Check-be2d5acb","./when-ad3237a0","./Math-5ca9b250","./combine-1510933d","./RuntimeError-767bd866","./ComponentDatatype-a867ddaa","./WebGLConstants-1c8239cc","./GeometryAttribute-da891979","./GeometryAttributes-27dc652d","./GeometryPipeline-3334f964","./AttributeCompression-9fbb8447","./EncodedCartesian3-a785c24c","./IndexDatatype-9504f550","./IntersectionTests-75083888","./Plane-bb88dd7e","./WebMercatorProjection-2bca7e98"],function(i,e,t,r,n,a,c,o,s,m,b,d,P,p,u,y,C,f,l,G){"use strict";return e(function(e,t){return e=i.PrimitivePipeline.unpackCombineGeometryParameters(e),e=i.PrimitivePipeline.combineGeometry(e),i.PrimitivePipeline.packCombineGeometryResults(e,t)})});
