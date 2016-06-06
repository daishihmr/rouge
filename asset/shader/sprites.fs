precision mediump float;

uniform sampler2D texture;

varying vec2 vUv;
varying vec2 vFrame;
varying float vAlpha;

const float unit = 32.0 / 256.0;

void main(void){
  vec4 tc = texture2D(texture, vUv + vFrame * unit);
  gl_FragColor = vec4(tc.rgb + vec3(1.0, 0.0, 0.0), tc.a * vAlpha);
}