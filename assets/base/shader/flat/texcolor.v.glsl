attribute vec3 vertPos;
attribute vec4 color;
attribute vec2 texCoord;

varying vec4 vColor;
varying vec2 vTexCoord;

void main(void) {
  gl_Position = vec4(vertPos, 1.0);
  vTexCoord = texCoord;
  vColor = color;
}
