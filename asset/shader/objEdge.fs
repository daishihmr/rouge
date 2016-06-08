precision mediump float;

uniform vec4 color;

varying float vAlpha;

void main(void){
  gl_FragColor = color * vec4(vec3(1.0), vAlpha);
}
