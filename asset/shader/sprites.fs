precision mediump float;

uniform sampler2D texture;

varying vec2 vUv;
varying vec2 vFrame;
varying vec4 vColor;

const float unit = 1.0 / 8.0;

void main(void){
  vec4 tc = texture2D(texture, vUv + vFrame * unit);
  gl_FragColor = tc * vColor;
}
