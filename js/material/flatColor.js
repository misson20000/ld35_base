import {Colors} from "../gfxutils.js";
import {Vec4, Mat4} from "../math.js";

export default (r, program, maxTriangles = 10000) => {
  let color = Colors.WHTIE;
  let tempVec = Vec4.create();
  let matrix = Mat4.identity;

  let gl = r.gl;

  let vertexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);

  let bufferContent = new Float32Array(maxTriangles
                                       * 3 // 3 vertices per triangle
                                       * 7); // 7 components per vertex (vec3 pos + vec4 color)
  let triangleIndex = 0;
  let bufferHead = 0;
  gl.bufferData(gl.ARRAY_BUFFER, bufferContent, gl.DYNAMIC_DRAW);
  gl.bindBuffer(gl.ARRAY_BUFFER, null);
  
  let bufferVertex = (x, y) => {
    tempVec.x = x;
    tempVec.y = y;
    tempVec.multiply(matrix);
    bufferContent[bufferHead++] = tempVec.x;
    bufferContent[bufferHead++] = tempVec.y;
    bufferContent[bufferHead++] = tempVec.z;
    bufferContent[bufferHead++] = color.r;
    bufferContent[bufferHead++] = color.g;
    bufferContent[bufferHead++] = color.b;
    bufferContent[bufferHead++] = color.a;
  };

  let a_vertPos = program.attributes.vertPos;
  let a_color = program.attributes.color;

  let flush = () => {
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, bufferContent);
    
    gl.useProgram(program.program);
    
    gl.enableVertexAttribArray(a_vertPos.location);
    gl.enableVertexAttribArray(a_color.location);
    
    gl.vertexAttribPointer(a_vertPos.location, 3,
                           gl.FLOAT, false,
                           (3 + 4) * 4, 0);
    gl.vertexAttribPointer(a_color.location, 4,
                           gl.FLOAT, false,
                           (3 + 4) * 4, 3 * 4);
    
    gl.drawArrays(gl.TRIANGLES, 0, triangleIndex * 3);
    
    gl.disableVertexAttribArray(a_vertPos.location);
    gl.disableVertexAttribArray(a_color.location);
    
    bufferHead = 0;
    triangleIndex = 0;
    r.unbindMaterial();
  };
  
  let writeTriangle;
  
  let self = {
    setColor(c) {
      color = c;
    },
    setMatrix(mat) {
      matrix = mat;
    },
    rect(x, y, w, h) {
      bufferVertex(x + 0, y + 0);
      bufferVertex(x + 0, y + h);
      bufferVertex(x + w, y + 0);
      writeTriangle();

      bufferVertex(x + w, y + h);
      bufferVertex(x + 0, y + h);
      bufferVertex(x + w, y + 0);
      writeTriangle();
    },
    rectCorners(x1, y1, x2, y2) {
      bufferVertex(x1, y1);
      bufferVertex(x1, y2);
      bufferVertex(x2, y1);
      writeTriangle();

      bufferVertex(x2, y2);
      bufferVertex(x1, y2);
      bufferVertex(x2, y1);
      writeTriangle();
    },
    triangle(x1, y1, x2, y2, x3, y3) {
      bufferVertex(x1, y1);
      bufferVertex(x2, y2);
      bufferVertex(x3, y3);
      writeTriangle();
    }
  };

  writeTriangle = () => {
    triangleIndex++;
    r.changeMaterial(self, flush);
    if(triangleIndex >= maxTriangles) {
      flush();
    }
  };
  
  return self;
};
