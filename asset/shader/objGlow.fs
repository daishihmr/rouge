precision mediump float;

uniform sampler2D texture;

varying vec2 vUv;
varying float vAlpha;

vec3 rgb2hsv(vec3 c) {
  vec4 K = vec4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0);
  vec4 p = mix(vec4(c.bg, K.wz), vec4(c.gb, K.xy), step(c.b, c.g));
  vec4 q = mix(vec4(p.xyw, c.r), vec4(c.r, p.yzx), step(p.x, c.r));

  float d = q.x - min(q.w, q.y);
  float e = 1.0e-10;
  return vec3(abs(q.z + (q.w - q.y) / (6.0 * d + e)), d / (q.x + e), q.x);
}

void main(void){
  vec4 color = texture2D(texture, vUv);
  vec3 hsv = rgb2hsv(color.rgb);
  if (hsv.y > 0.6) {
    gl_FragColor = color * vec4(vec3(1.0), vAlpha);
  } else {
    gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0) * vec4(vec3(1.0), vAlpha);
  }
}
