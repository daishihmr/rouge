precision mediump float;

uniform vec4 color;

varying float vFog;
varying float vAlpha;

void main(void){
  gl_FragColor = mix(vec4(0.0, 0.0, 0.0, 1.0), color, vFog) * vec4(vec3(1.0), vAlpha);
}
