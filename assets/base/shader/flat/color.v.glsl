attribute vec3 vertPos;
attribute vec4 color;

varying vec4 vColor;

void main(void) {
  gl_Position = vec4(vertPos, 1.0);
  vColor = color;
}
