precision mediump float;

uniform sampler2D texture;
uniform vec2 canvasSize;
uniform float alpha;

varying vec2 vUv;

void main(void) {
  vec2 cs = canvasSize;
  vec4 color = texture2D(texture, vUv);
  gl_FragColor = vec4(color.rgb, color.a * alpha);
}
