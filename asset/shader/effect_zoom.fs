precision mediump float;

uniform sampler2D texture;
uniform vec2 canvasSize;
uniform vec2 center;
uniform float strength;

varying vec2 vUv;

const float len = 30.0;

// https://gist.github.com/johansten/3633917
float random(const vec2 co) {
  float a = fract(dot(co, vec2(2.067390879775102, 12.451168662908249))) - 0.5;
  float s = a * (6.182785114200511 + a*a * (-38.026512460676566 + a*a * 53.392573080032137));
  return fract(s * 43758.5453);
}

void main(void) {
  vec4 color = vec4(0.0);
  float totalWeight = 0.0;

  float r = random(gl_FragCoord.xy / canvasSize);
  vec2 v = vUv - center;
  for (float i = 0.0; i <= len; i++) {
    float rate = (i + r) / len;
    float weight = rate - rate * rate;
    vec2 t = v * rate * strength / len;
    color += texture2D(texture, vUv - t) * weight;
    totalWeight += weight;
  }

  gl_FragColor = color / totalWeight;
}
