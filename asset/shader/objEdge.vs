attribute vec3 position;

attribute float instanceVisible;
attribute vec3 instanceMatrix0;
attribute vec3 instanceMatrix1;
attribute vec3 instanceMatrix2;
attribute vec3 instanceMatrix3;
attribute float instanceAlpha;

uniform mat4 vpMatrix;
uniform vec3 cameraPosition;

varying float vAlpha;

void main(void) {
  vAlpha = instanceAlpha;

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
