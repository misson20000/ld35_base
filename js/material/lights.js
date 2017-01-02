import {AssetManager} from "../assetmgr.js";
import {Colors} from "../gfxutils.js";
import {Vec4, Mat4} from "../math.js";

export default (r, maxTriangles = 10000) => {
  let program = AssetManager.getAsset("lights.shader.rect");
  
  let tempVec = Vec4.create();
  let matrix = Mat4.identity;

  let gl = r.gl;

  let vertexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);

  let totalComponents =
      2 + // worldPos
      2 + // vertPos
      2 + // aPos
      2 + // bPos
      2 + // radius
      4;  // color

  
  let bufferContent = new Float32Array(maxTriangles
                                       * 3 // 3 vertices per triangle
                                       * totalComponents);
  let triangleIndex = 0;
  let bufferHead = 0;
  gl.bufferData(gl.ARRAY_BUFFER, bufferContent, gl.DYNAMIC_DRAW);
  gl.bindBuffer(gl.ARRAY_BUFFER, null);

  let aPos = Vec4.create();
  let bPos = Vec4.create();
  let spread = 5;
  let radius = 20;
  let color = Colors.WHITE;
  
  let bufferVertex = (x, y) => {
    tempVec.x = x;
    tempVec.y = y;
    bufferContent[bufferHead++] = tempVec.x;
    bufferContent[bufferHead++] = tempVec.y;
    tempVec.multiply(matrix);
    bufferContent[bufferHead++] = tempVec.x;
    bufferContent[bufferHead++] = tempVec.y;
    bufferContent[bufferHead++] = aPos.x;
    bufferContent[bufferHead++] = aPos.y;
    bufferContent[bufferHead++] = bPos.x;
    bufferContent[bufferHead++] = bPos.y;
    bufferContent[bufferHead++] = radius;
    bufferContent[bufferHead++] = spread;
    bufferContent[bufferHead++] = color.r;
    bufferContent[bufferHead++] = color.g;
    bufferContent[bufferHead++] = color.b;
    bufferContent[bufferHead++] = color.a;
  };

  let a_worldPos = program.attributes.worldPos;
  let a_vertPos = program.attributes.vertPos;
  let a_aPos = program.attributes.aPos;
  let a_bPos = program.attributes.bPos;
  let a_radius = program.attributes.radius;
  let a_color = program.attributes.color;

  let flush = () => {
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, bufferContent);
    
    gl.useProgram(program.program);

    gl.enableVertexAttribArray(a_worldPos.location);
    gl.enableVertexAttribArray(a_vertPos.location);
    gl.enableVertexAttribArray(a_aPos.location);
    gl.enableVertexAttribArray(a_bPos.location);
    gl.enableVertexAttribArray(a_radius.location);
    gl.enableVertexAttribArray(a_color.location);
    
    gl.vertexAttribPointer(a_worldPos.location, 2, gl.FLOAT, false,
                           totalComponents * 4, 0 * 4);
    gl.vertexAttribPointer(a_vertPos.location, 2, gl.FLOAT, false,
                           totalComponents * 4, 2 * 4);
    gl.vertexAttribPointer(a_aPos.location, 2, gl.FLOAT, false,
                           totalComponents * 4, 4 * 4);
    gl.vertexAttribPointer(a_bPos.location, 2, gl.FLOAT, false,
                           totalComponents * 4, 6 * 4);
    gl.vertexAttribPointer(a_radius.location, 2, gl.FLOAT, false,
                           totalComponents * 4, 8 * 4);
    gl.vertexAttribPointer(a_color.location, 4, gl.FLOAT, false,
                           totalComponents * 4, 10 * 4);
    
    gl.drawArrays(gl.TRIANGLES, 0, triangleIndex * 3);

    gl.disableVertexAttribArray(a_worldPos.location);
    gl.disableVertexAttribArray(a_vertPos.location);
    gl.disableVertexAttribArray(a_aPos.location);
    gl.disableVertexAttribArray(a_bPos.location);
    gl.disableVertexAttribArray(a_radius.location);
    gl.disableVertexAttribArray(a_color.location);
    
    bufferHead = 0;
    triangleIndex = 0;
    r.unbindMaterial();
  };
  
  let writeTriangle;
  let lineMatrix = Mat4.create();
  
  let self = {
    setColor(c) {
      color = c;
    },
    setMatrix(mat) {
      matrix = mat;
    },
    rect(x, y, w, h, r, sp) {
      aPos.x = x;
      aPos.y = y;
      bPos.x = x + w;
      bPos.y = y + h;
      radius = r;
      spread = sp;
      
      r+= sp;
      x-= r; y-= r;
      w+=2*r; h+= 2*r;
      
      bufferVertex(x + 0, y + 0);
      bufferVertex(x + 0, y + h);
      bufferVertex(x + w, y + 0);
      writeTriangle();

      bufferVertex(x + w, y + h);
      bufferVertex(x + 0, y + h);
      bufferVertex(x + w, y + 0);
      writeTriangle();
    },
    line(x1, y1, x2, y2, r, sp) {
      lineMatrix.load.from(matrix);
      let oldMatrix = matrix;
      self.setMatrix(lineMatrix);

      matrix.transform.translate(x1, y1);
      let length = Math.sqrt(Math.pow(x2-x1,2) + Math.pow(y2-y1,2));
      let angle = Math.atan2(y2-y1, x2-x1);
      matrix.transform.rotate(angle);
      
      self.rect(0, 0, length, 0, r, sp);
      self.setMatrix(oldMatrix);
    },
    point(x, y, r, sp) {
      self.rect(x, y, 0, 0, r, sp);
    },
    triangle(x1, y1, x2, y2, x3, y3) {
      bufferVertex(x1, y1);
      bufferVertex(x2, y2);
      bufferVertex(x3, y3);
      writeTrangle();
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
