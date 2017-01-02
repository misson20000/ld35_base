import {Colors} from "../gfxutils.js";
import {Vec4, Mat4} from "../math.js";

export default (r, program, maxTriangles = 10000) => {
  let color = Colors.WHITE;
  let tempVec = Vec4.create();
  let matrix = Mat4.identity;

  let gl = r.gl;

  let vertexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);

  let bufferContent = new Float32Array(maxTriangles
                                       * 3 // 3 vertices per triangle
                                       * 9); // 9 components per vertex (vec3 pos + vec4 color + vec2 texcoord)
  let triangleIndex = 0;
  let bufferHead = 0;
  gl.bufferData(gl.ARRAY_BUFFER, bufferContent, gl.DYNAMIC_DRAW);
  gl.bindBuffer(gl.ARRAY_BUFFER, null);
  
  let bufferVertex = (x, y, tx, ty) => {
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
    bufferContent[bufferHead++] = tx;
    bufferContent[bufferHead++] = ty;    
  };

  let a_vertPos = program.attributes.vertPos;
  let a_color = program.attributes.color;
  let a_texCoord = program.attributes.texCoord;
  let u_texture = program.uniforms.tex;

  let texture = null;
  
  let flush = () => {
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, bufferContent);
    
    gl.useProgram(program.program);
    
    gl.enableVertexAttribArray(a_vertPos.location);
    gl.enableVertexAttribArray(a_color.location);
    gl.enableVertexAttribArray(a_texCoord.location);
    
    gl.vertexAttribPointer(a_vertPos.location, 3,
                           gl.FLOAT, false,
                           9 * 4, 0);
    gl.vertexAttribPointer(a_color.location, 4,
                           gl.FLOAT, false,
                           9 * 4, 3 * 4);
    gl.vertexAttribPointer(a_texCoord.location, 2,
                           gl.FLOAT, false,
                           9 * 4, 7 * 4);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture.glTex);
    gl.uniform1i(u_texture.location, 0);
    
    gl.drawArrays(gl.TRIANGLES, 0, triangleIndex * 3);
    
    gl.disableVertexAttribArray(a_vertPos.location);
    gl.disableVertexAttribArray(a_color.location);
    gl.disableVertexAttribArray(a_texCoord.location);
    
    bufferHead = 0;
    triangleIndex = 0;
    texture = null;
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
    getMatrix() {
      return matrix;
    },
    rect(x, y, w, h, tex, tx=0, ty=0, tw=1, th=1)  {
      if(texture && texture != tex) {
        flush();
      }
      texture = tex;
      
      bufferVertex(x + 0, y + 0, tx +  0, ty +  0);
      bufferVertex(x + 0, y + h, tx +  0, ty + th);
      bufferVertex(x + w, y + 0, tx + tw, ty +  0);
      writeTriangle();

      bufferVertex(x + w, y + h, tx + tw, ty + th);
      bufferVertex(x + 0, y + h, tx +  0, ty + th);
      bufferVertex(x + w, y + 0, tx + tw, ty +  0);
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
