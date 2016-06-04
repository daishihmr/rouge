attribute vec2 position;
attribute vec2 uv;

attribute float instanceVisible;
attribute vec2 instancePosition;
attribute float instanceRotation;
attribute float instanceScale;
attribute vec2 instanceFrame;
attribute float instanceAlpha;

uniform mat4 vpMatrix;
uniform float globalScale;

varying vec2 vUv;
varying vec2 vFrame;
varying float vAlpha;

void main(void) {
  vUv = uv;
  vFrame = instanceFrame;
  vAlpha = instanceAlpha;
  
  if (instanceVisible > 0.0) {
    float s = sin(-instanceRotation);
    float c = cos(-instanceRotation);
    mat4 m = mat4(
      vec4(  c,  -s, 0.0, 0.0),
      vec4(  s,   c, 0.0, 0.0),
      vec4(0.0, 0.0, 1.0, 0.0),
      vec4(instancePosition, 0.0, 1.0)
    ) * mat4(
      vec4(instanceScale * globalScale, 0.0, 0.0, 0.0),
      vec4(0.0, instanceScale * globalScale, 0.0, 0.0),
      vec4(0.0, 0.0, 1.0, 0.0),
      vec4(0.0, 0.0, 0.0, 1.0)
    );
    mat4 mvpMatrix = vpMatrix * m;
    gl_Position = mvpMatrix * vec4(position, 0.0, 1.0);
  } else {
    gl_Position = vec4(0.0);
  }
}
