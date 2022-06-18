@binding(1) @group(0) var mySampler:sampler;
@binding(2) @group(0) var myTexture:texture_cube<f32>;
@stage(fragment)
fn main(
  @location(0) fragUV:vec2<f32>,
  @location(1) fragPosition:vec4<f32>,
) -> @location(0) vec4<f32> {
  var cubemapVec = fragPosition.xyz - vec3<f32>(0.5, 0.5, 0.5);
  return textureSample(myTexture, mySampler, cubemapVec);
}
