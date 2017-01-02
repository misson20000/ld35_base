varying lowp vec2 vTexCoord;
varying lowp vec4 vColor;

uniform sampler2D tex;

void main(void) {
  gl_FragColor = vec4(texture2D(tex, vTexCoord)) * vec4(vColor.rgb*vColor.a, vColor.a);
}
