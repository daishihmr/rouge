precision mediump float;

uniform sampler2D texture;

varying vec2 vUv;
varying vec4 vColor;
varying float vAlpha;

void main(void){
  vec4 color = texture2D(texture, vUv);
  gl_FragColor = color * vColor * vec4(vec3(1.0), vAlpha);
}
