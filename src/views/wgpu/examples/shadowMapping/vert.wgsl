struct Scene{
    lightViewProjMatrix:mat4x4<f32>;
    cameraViewProjMatrix:mat4x4<f32>;
    lightPosition:vec3<f32>;
};
struct Model{
    modelMatrix:mat4x4<f32>
};
@group(0) @binding(0) var<uniform> scene:Scene;
@group(1) @binding(0) var<uniform> model:Model;

struct VertexOutput {
  @location(0) shadowPos : vec3<f32>;
  @location(1) fragPos : vec3<f32>;
  @location(2) fragNorm : vec3<f32>;

  @builtin(position) Position : vec4<f32>;
};


@stage(vertex)
fn main(
    @location(0) modelPosition:vec3<f32>,
    @location(1) modeoNormal:vec3<f32>
)->VertexOutput{
    var output:VertexOutput;
    let posFromLight:vec4<f32> = scene.lightViewProjMatrix*model.modelMatrix*vec4<f32>(modelPosition,1.0);
    output.shadowPos = vec3<f32>(
        posFromLight.xy*vec2<f32>(0.5,-0.5)+vec2<f32>(0.5,0.5),
        posFromLight.z
    );
    output.Position = scene.cameraViewProjMatrix*model.modelMatrix*vec4<f32>(modelPosition,1.0);
    output.fragPos = output.Position.xyz;
    output.fragNorm = modeoNormal;
    return output;
}