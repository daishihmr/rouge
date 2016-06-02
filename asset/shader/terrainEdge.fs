precision mediump float;

uniform vec4 color;

varying float vFog;

void main(void){
  gl_FragColor = mix(vec4(0.0, 0.0, 0.0, 1.0), color, vFog);
}
