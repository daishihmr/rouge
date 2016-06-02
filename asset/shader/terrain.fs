precision mediump float;

varying vec2 vUv;
varying vec4 vColor;
varying float vFog;

void main(void){
  gl_FragColor = mix(vec4(0.0, 0.0, 0.0, 1.0), vColor, vFog);
}
