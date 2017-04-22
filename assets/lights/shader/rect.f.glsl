#version 100

precision lowp float;

varying vec4 vColor;
varying vec2 vA;
varying vec2 vB;
varying vec2 vRad;
varying vec2 vPos;

vec2 dist2d(vec2 p, vec2 a, vec2 b) {
  vec2 center = (a + b)/vec2(2.0);
  vec2 size = abs(b - a);

  return max(abs(p - center) - size / vec2(2.0), vec2(0.0));
}

void main(void) {
  vec4 color = vec4(vColor.rgb, vColor.a * clamp(1.0+vRad.y/vRad.x-length(dist2d(vPos, vA, vB))/vRad.x, 0.0, 1.0));
  gl_FragColor = vec4(color.rgb * color.a, color.a);
  //gl_FragColor = vec4(1);
}
