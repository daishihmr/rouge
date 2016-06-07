precision mediump float;

uniform sampler2D texture;
uniform vec2 canvasSize;

varying vec2 vUv;

void main(void) {
  vec2 u = 1.0 / canvasSize;

  vec4 color = vec4(0.0);

  color += texture2D(texture, vUv + vec2(-1.0, -1.0) * u) *  1.0 / 16.0;
  color += texture2D(texture, vUv + vec2( 0.0, -1.0) * u) *  2.0 / 16.0;
  color += texture2D(texture, vUv + vec2( 1.0, -1.0) * u) *  1.0 / 16.0;

  color += texture2D(texture, vUv + vec2(-1.0,  0.0) * u) *  2.0 / 16.0;
  color += texture2D(texture, vUv + vec2( 0.0,  0.0) * u) *  4.0 / 16.0;
  color += texture2D(texture, vUv + vec2( 1.0,  0.0) * u) *  2.0 / 16.0;

  color += texture2D(texture, vUv + vec2(-1.0,  1.0) * u) *  1.0 / 16.0;
  color += texture2D(texture, vUv + vec2( 0.0,  1.0) * u) *  2.0 / 16.0;
  color += texture2D(texture, vUv + vec2( 1.0,  1.0) * u) *  1.0 / 16.0;

  gl_FragColor = color;
}
