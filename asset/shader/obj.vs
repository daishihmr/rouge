attribute vec3 position;
attribute vec2 uv;
attribute vec3 normal;

attribute float instanceVisible;
attribute vec3 instanceMatrix0;
attribute vec3 instanceMatrix1;
attribute vec3 instanceMatrix2;
attribute vec3 instanceMatrix3;
attribute float instanceAlpha;

uniform mat4 vpMatrix;
uniform vec3 lightDirection;
uniform vec4 diffuseColor;
uniform vec4 ambientColor;
uniform vec3 cameraPosition;

varying vec2 vUv;
varying vec4 vColor;
varying float vAlpha;

// https://github.com/stackgl/glsl-inverse
mat4 inverse(mat4 m) {
  float
      a00 = m[0][0], a01 = m[0][1], a02 = m[0][2], a03 = m[0][3],
      a10 = m[1][0], a11 = m[1][1], a12 = m[1][2], a13 = m[1][3],
      a20 = m[2][0], a21 = m[2][1], a22 = m[2][2], a23 = m[2][3],
      a30 = m[3][0], a31 = m[3][1], a32 = m[3][2], a33 = m[3][3],

      b00 = a00 * a11 - a01 * a10,
      b01 = a00 * a12 - a02 * a10,
      b02 = a00 * a13 - a03 * a10,
      b03 = a01 * a12 - a02 * a11,
      b04 = a01 * a13 - a03 * a11,
      b05 = a02 * a13 - a03 * a12,
      b06 = a20 * a31 - a21 * a30,
      b07 = a20 * a32 - a22 * a30,
      b08 = a20 * a33 - a23 * a30,
      b09 = a21 * a32 - a22 * a31,
      b10 = a21 * a33 - a23 * a31,
      b11 = a22 * a33 - a23 * a32,

      det = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;

  return mat4(
      a11 * b11 - a12 * b10 + a13 * b09,
      a02 * b10 - a01 * b11 - a03 * b09,
      a31 * b05 - a32 * b04 + a33 * b03,
      a22 * b04 - a21 * b05 - a23 * b03,
      a12 * b08 - a10 * b11 - a13 * b07,
      a00 * b11 - a02 * b08 + a03 * b07,
      a32 * b02 - a30 * b05 - a33 * b01,
      a20 * b05 - a22 * b02 + a23 * b01,
      a10 * b10 - a11 * b08 + a13 * b06,
      a01 * b08 - a00 * b10 - a03 * b06,
      a30 * b04 - a31 * b02 + a33 * b00,
      a21 * b02 - a20 * b04 - a23 * b00,
      a11 * b07 - a10 * b09 - a12 * b06,
      a00 * b09 - a01 * b07 + a02 * b06,
      a31 * b01 - a30 * b03 - a32 * b00,
      a20 * b03 - a21 * b01 + a22 * b00) / det;
}

void main(void) {
  vUv = uv;
  vAlpha = instanceAlpha;
  
  if (instanceVisible < 0.5 || instanceAlpha == 0.0) {
    gl_Position = vec4(0.0, 0.0, 0.0, 1.0);
  } else {
    mat4 mMatrix = mat4(
      vec4(instanceMatrix0, 0.0),
      vec4(instanceMatrix1, 0.0),
      vec4(instanceMatrix2, 0.0),
      vec4(instanceMatrix3, 1.0)
    );
    
    mat4 mvpMatrix = vpMatrix * mMatrix;
    mat4 invMatrix = inverse(mMatrix);
    
    vec3 _position = (mMatrix * vec4(position, 0.0)).xyz;
    vec3 _normal = (mMatrix * vec4(normal, 0.0)).xyz;
    vec3 _eye = normalize(_position - cameraPosition);

    vec3 halfVector = normalize(lightDirection.xyz + _eye);

    float diffuse = dot(_normal, lightDirection);
    float specular = pow(clamp(dot(_normal, halfVector), 0.0, 1.0), 300.0);
    
    vec4 a = ambientColor;
    vec4 d = diffuseColor * vec4(vec3(diffuse), 1.0);
    vec4 s = vec4(vec3(specular), 0.0);

    vec3 colorRgb = (clamp(a, 0.0, 1.0) + clamp(d, 0.0, 1.0) + clamp(s, 0.0, 1.0)).rgb;
    float colorA = a.a * d.a;

    vColor = vec4(vec3(colorRgb), colorA);

    gl_Position = mvpMatrix * vec4(position, 1.0);

  }
}
