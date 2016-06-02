attribute vec3 position;

attribute float instanceVisible;
attribute vec3 instanceMatrix0;
attribute vec3 instanceMatrix1;
attribute vec3 instanceMatrix2;
attribute vec3 instanceMatrix3;

uniform mat4 vpMatrix;
uniform vec3 cameraPosition;

varying float vFog;

const float fogStart = 20.0;
const float fogEnd = 50.0;

void main(void) {
  if (instanceVisible < 0.5) {
    gl_Position = vec4(0.0, 0.0, 0.0, 1.0);
  } else {
    mat4 mMatrix = mat4(
      vec4(instanceMatrix0, 0.0),
      vec4(instanceMatrix1, 0.0),
      vec4(instanceMatrix2, 0.0),
      vec4(instanceMatrix3, 1.0)
    );
    
    mat4 mvpMatrix = vpMatrix * mMatrix;
    
    vec3 pos = (mMatrix * vec4(position, 1.0)).xyz;
    float distance = length(cameraPosition - pos);
    vFog = clamp((fogEnd - distance) / (fogEnd - fogStart), 0.0, 1.0);
    gl_Position = mvpMatrix * vec4(position, 1.0);
  }
}
