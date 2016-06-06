precision mediump float;

uniform sampler2D texture;
uniform vec2 canvasSize;

varying vec2 vUv;

void main(void) {
  vec2 u = 2.0 / canvasSize * 2.0;

  vec4 color = vec4(0.0);

  color += texture2D(texture, vUv + vec2(-3.0, -3.0) * u) *  1.0 / 4096.0;
  color += texture2D(texture, vUv + vec2(-2.0, -3.0) * u) *  6.0 / 4096.0;
  color += texture2D(texture, vUv + vec2(-1.0, -3.0) * u) * 15.0 / 4096.0;
  color += texture2D(texture, vUv + vec2( 0.0, -3.0) * u) * 20.0 / 4096.0;
  color += texture2D(texture, vUv + vec2( 1.0, -3.0) * u) * 15.0 / 4096.0;
  color += texture2D(texture, vUv + vec2( 2.0, -3.0) * u) *  6.0 / 4096.0;
  color += texture2D(texture, vUv + vec2(-3.0, -3.0) * u) *  1.0 / 4096.0;

  color += texture2D(texture, vUv + vec2(-3.0, -2.0) * u) *  6.0 / 4096.0;
  color += texture2D(texture, vUv + vec2(-2.0, -2.0) * u) * 36.0 / 4096.0;
  color += texture2D(texture, vUv + vec2(-1.0, -2.0) * u) * 90.0 / 4096.0;
  color += texture2D(texture, vUv + vec2( 0.0, -2.0) * u) *120.0 / 4096.0;
  color += texture2D(texture, vUv + vec2( 1.0, -2.0) * u) * 90.0 / 4096.0;
  color += texture2D(texture, vUv + vec2( 2.0, -2.0) * u) * 36.0 / 4096.0;
  color += texture2D(texture, vUv + vec2(-3.0, -2.0) * u) *  6.0 / 4096.0;

  color += texture2D(texture, vUv + vec2(-3.0, -1.0) * u) * 15.0 / 4096.0;
  color += texture2D(texture, vUv + vec2(-2.0, -1.0) * u) * 90.0 / 4096.0;
  color += texture2D(texture, vUv + vec2(-1.0, -1.0) * u) *225.0 / 4096.0;
  color += texture2D(texture, vUv + vec2( 0.0, -1.0) * u) *300.0 / 4096.0;
  color += texture2D(texture, vUv + vec2( 1.0, -1.0) * u) *225.0 / 4096.0;
  color += texture2D(texture, vUv + vec2( 2.0, -1.0) * u) * 90.0 / 4096.0;
  color += texture2D(texture, vUv + vec2(-3.0, -1.0) * u) * 15.0 / 4096.0;

  color += texture2D(texture, vUv + vec2(-3.0,  0.0) * u) * 20.0 / 4096.0;
  color += texture2D(texture, vUv + vec2(-2.0,  0.0) * u) *120.0 / 4096.0;
  color += texture2D(texture, vUv + vec2(-1.0,  0.0) * u) *300.0 / 4096.0;
  color += texture2D(texture, vUv + vec2( 0.0,  0.0) * u) *400.0 / 4096.0;
  color += texture2D(texture, vUv + vec2( 1.0,  0.0) * u) *300.0 / 4096.0;
  color += texture2D(texture, vUv + vec2( 2.0,  0.0) * u) *120.0 / 4096.0;
  color += texture2D(texture, vUv + vec2(-3.0,  0.0) * u) * 20.0 / 4096.0;

  color += texture2D(texture, vUv + vec2(-3.0,  1.0) * u) * 15.0 / 4096.0;
  color += texture2D(texture, vUv + vec2(-2.0,  1.0) * u) * 90.0 / 4096.0;
  color += texture2D(texture, vUv + vec2(-1.0,  1.0) * u) *225.0 / 4096.0;
  color += texture2D(texture, vUv + vec2( 0.0,  1.0) * u) *300.0 / 4096.0;
  color += texture2D(texture, vUv + vec2( 1.0,  1.0) * u) *225.0 / 4096.0;
  color += texture2D(texture, vUv + vec2( 2.0,  1.0) * u) * 90.0 / 4096.0;
  color += texture2D(texture, vUv + vec2(-3.0,  1.0) * u) * 15.0 / 4096.0;

  color += texture2D(texture, vUv + vec2(-3.0,  2.0) * u) *  6.0 / 4096.0;
  color += texture2D(texture, vUv + vec2(-2.0,  2.0) * u) * 36.0 / 4096.0;
  color += texture2D(texture, vUv + vec2(-1.0,  2.0) * u) * 90.0 / 4096.0;
  color += texture2D(texture, vUv + vec2( 0.0,  2.0) * u) *120.0 / 4096.0;
  color += texture2D(texture, vUv + vec2( 1.0,  2.0) * u) * 90.0 / 4096.0;
  color += texture2D(texture, vUv + vec2( 2.0,  2.0) * u) * 36.0 / 4096.0;
  color += texture2D(texture, vUv + vec2(-3.0,  2.0) * u) *  6.0 / 4096.0;

  color += texture2D(texture, vUv + vec2(-3.0,  3.0) * u) *  1.0 / 4096.0;
  color += texture2D(texture, vUv + vec2(-2.0,  3.0) * u) *  6.0 / 4096.0;
  color += texture2D(texture, vUv + vec2(-1.0,  3.0) * u) * 15.0 / 4096.0;
  color += texture2D(texture, vUv + vec2( 0.0,  3.0) * u) * 20.0 / 4096.0;
  color += texture2D(texture, vUv + vec2( 1.0,  3.0) * u) * 15.0 / 4096.0;
  color += texture2D(texture, vUv + vec2( 2.0,  3.0) * u) *  6.0 / 4096.0;
  color += texture2D(texture, vUv + vec2(-3.0,  3.0) * u) *  1.0 / 4096.0;

  gl_FragColor = color;
}
