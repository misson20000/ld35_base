varying lowp vec4 vColor;

void main(void) {
  gl_FragColor = vec4(vColor.rgb*vColor.a, vColor.a);
}
