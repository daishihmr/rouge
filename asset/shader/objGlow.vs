attribute vec3 position;
attribute vec2 uv;
attribute vec3 normal;

attribute float instanceVisible;
attribute vec3 instanceMatrix0;
attribute vec3 instanceMatrix1;
attribute vec3 instanceMatrix2;
attribute vec3 instanceMatrix3;
attribute float instanceAlpha;

uniform mat4 vpMatrix;

varying vec2 vUv;
varying float vAlpha;

void main(void) {
  vUv = uv;
  vAlpha = instanceAlpha;

  vec3 nc = normal;
  
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
    gl_Position = mvpMatrix * vec4(position, 1.0);
  }
}
