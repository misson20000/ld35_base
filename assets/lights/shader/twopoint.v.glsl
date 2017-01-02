#version 100

precision mediump float;

attribute vec2 worldPos;
attribute vec2 vertPos;
attribute vec2 aPos;
attribute vec2 bPos;
attribute vec2 radius;
attribute vec4 color;

varying vec4 vColor;
varying vec2 vA;
varying vec2 vB;
varying vec2 vRad;
varying vec2 vPos;

void main(void) {
  gl_Position = vec4(vertPos, 0.0, 1.0);

  vColor = color;
  vA = aPos;
  vB = bPos;
  vRad = radius;
  vPos = worldPos;
}
