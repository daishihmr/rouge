precision mediump float;

uniform sampler2D texture;
uniform float alpha;

varying vec2 vUv;

void main(void) {
  vec4 color = texture2D(texture, vUv);
  gl_FragColor = vec4(color.rgb, color.a * alpha);
}
