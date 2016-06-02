precision mediump float;

uniform sampler2D texture;
uniform float alpha;
uniform float canvasSize;

varying vec2 vUv;

void main(void) {
  float u = 2.0 / canvasSize * 1.0;
  vec4 color = texture2D(texture, vUv);

  color += texture2D(texture, vUv + vec2(-2.0, -2.0) * u) *  1.0 / 256.0;
  color += texture2D(texture, vUv + vec2(-1.0, -2.0) * u) *  4.0 / 256.0;
  color += texture2D(texture, vUv + vec2( 0.0, -2.0) * u) *  6.0 / 256.0;
  color += texture2D(texture, vUv + vec2( 1.0, -2.0) * u) *  4.0 / 256.0;
  color += texture2D(texture, vUv + vec2( 2.0, -2.0) * u) *  1.0 / 256.0;

  color += texture2D(texture, vUv + vec2(-2.0, -1.0) * u) *  4.0 / 256.0;
  color += texture2D(texture, vUv + vec2(-1.0, -1.0) * u) * 16.0 / 256.0;
  color += texture2D(texture, vUv + vec2( 0.0, -1.0) * u) * 24.0 / 256.0;
  color += texture2D(texture, vUv + vec2( 1.0, -1.0) * u) * 16.0 / 256.0;
  color += texture2D(texture, vUv + vec2( 2.0, -1.0) * u) *  4.0 / 256.0;

  color += texture2D(texture, vUv + vec2(-2.0,  0.0) * u) *  6.0 / 256.0;
  color += texture2D(texture, vUv + vec2(-1.0,  0.0) * u) * 24.0 / 256.0;
  color += texture2D(texture, vUv + vec2( 0.0,  0.0) * u) * 36.0 / 256.0;
  color += texture2D(texture, vUv + vec2( 1.0,  0.0) * u) * 24.0 / 256.0;
  color += texture2D(texture, vUv + vec2( 2.0,  0.0) * u) *  6.0 / 256.0;

  color += texture2D(texture, vUv + vec2(-2.0,  1.0) * u) *  4.0 / 256.0;
  color += texture2D(texture, vUv + vec2(-1.0,  1.0) * u) * 16.0 / 256.0;
  color += texture2D(texture, vUv + vec2( 0.0,  1.0) * u) * 24.0 / 256.0;
  color += texture2D(texture, vUv + vec2( 1.0,  1.0) * u) * 16.0 / 256.0;
  color += texture2D(texture, vUv + vec2( 2.0,  1.0) * u) *  4.0 / 256.0;

  color += texture2D(texture, vUv + vec2(-2.0,  2.0) * u) *  1.0 / 256.0;
  color += texture2D(texture, vUv + vec2(-1.0,  2.0) * u) *  4.0 / 256.0;
  color += texture2D(texture, vUv + vec2( 0.0,  2.0) * u) *  6.0 / 256.0;
  color += texture2D(texture, vUv + vec2( 1.0,  2.0) * u) *  4.0 / 256.0;
  color += texture2D(texture, vUv + vec2( 2.0,  2.0) * u) *  1.0 / 256.0;

  gl_FragColor = clamp(vec4(color.rgb, color.a * alpha), 0.0, 1.0);
}
