import * as BlobUtil from "blob-util";

import {AssetManager} from "./assetmgr.js";
import {Mat4, Mat4Stack, Vec4} from "./math.js";
import {blobToImage} from "./util.js";
import {Colors} from "./gfxutils.js";

export let WebGLRenderer = (game, canvas, gl) => {
  if(!gl) {
    if(!canvas.getContext("webgl")) {
      throw "Could not open WebGL context (no parameters)";
    }
    if(!canvas.getContext("webgl", {alpha: false})) {
      throw "Could not open WebGL context {alpha: false}";
    }
    if(!canvas.getContext("webgl", {stencil: true})) {
      throw "Could not open WebGL context {stencil: true}";
    }
    if(!canvas.getContext("webgl", {alpha: false, stencil: true})) {
      throw "Could not open WebGL context {alpha: false, stencil: true}";
    }
    throw "Could not open WebGL context, all tests passed?!";
  }

  gl.enable(gl.BLEND);
  gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

  let pixelMatrix = Mat4.create();

  let currentMaterial = null;
  let currentMaterialFlush = null;
  let currentFramebuffer = null;
  
  let r = {
    gl,
    width: 0,
    height: 0,
    cwidth: 0,
    cheight: 0,
    manageSize() {
      if(canvas.width != window.innerWidth || canvas.height != window.innerHeight) {
        r.width = r.cwidth = canvas.width = window.innerWidth;
        r.height = r.cheight = canvas.height = window.innerHeight;

        gl.viewport(0, 0, canvas.width, canvas.height);
        
        if(game.state && game.state.updateSize) {
          game.state.updateSize(canvas.width, canvas.height);
        }
      }
    },
    clear(color) {
      gl.clearColor(color.r, color.g, color.b, color.a);
      gl.clear(gl.COLOR_BUFFER_BIT);
    },
    prepareFrame() {
      r.manageSize();
      currentMaterial = null;
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      gl.blendEquation(gl.FUNC_ADD);
      gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    },
    finalizeFrame() {
      r.flushMaterials();
    },
    
    // padding is extra space beyond the edges of the canvas that is guarenteed to be there
    // margin space is not guarenteed to be there; it serves only to make resizing smoother
    //  margin defaults to 50 pixels
    createFramebuffer(padding, margin=50) {
      let width = r.width + 2*padding + 2*margin;
      let height = r.height + 2*padding + 2*margin;
      
      let fb = gl.createFramebuffer();
      gl.bindFramebuffer(gl.FRAMEBUFFER, fb);

      let colorBuffer = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, colorBuffer);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, colorBuffer, 0);
      
      switch(gl.checkFramebufferStatus(gl.FRAMEBUFFER)) {
      case gl.FRAMEBUFFER_INCOMPLETE_ATTACHMENT:
        throw "FRAMEBUFFER_INCOMPLETE_ATTACHMENT";
      case gl.FRAMEBUFFER_INCOMPLETE_MISSING_ATTACHMENT:
        throw "FRAMEBUFFER_INCOMPLETE_MISSING_ATTACHMENT";
      case gl.FRAMEBUFFER_INCOMPLETE_DIMENSIONS:
        throw "FRAMEBUFFER_INCOMPLETE_DIMENSIONS";
      case gl.FRAMEBUFFER_UNSUPPORTED:
        throw "FRAMEBUFFER_UNSUPPORTED";
      case gl.FRAMEBUFFER_COMPLETE:
        break;
      default:
        throw "WTF?"
      }

      gl.bindTexture(gl.TEXTURE_2D, null);
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);

      let colorBufferObj = {
        glTex: colorBuffer,
        width: width,
        height: height
      };

      let matrix = Mat4.create();
      let originalMatrix = Mat4.create();
      let workingMatrix = Mat4.create();
      
      let computeMatrix = () => {
        matrix.load.scale(canvas.width/width, canvas.height/height);
      };
      
      computeMatrix();
      
      let self = {
        boundsMatrix: matrix,
        bind(modMat) {
          if(canvas.width + 2*padding > width
             || canvas.height + 2*padding > height) {
            width = r.cwidth + 2*padding + 2*margin;
            height = r.cheight + 2*padding + 2*margin;
            colorBufferObj.width = width;
            colorBufferObj.height = height;
            gl.bindTexture(gl.TEXTURE_2D, colorBuffer); // resize color buffer
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
            gl.bindTexture(gl.TEXTURE_2D, null);
          }

          computeMatrix();

          originalMatrix.load.from(modMat);
          workingMatrix.load.from(matrix);
          workingMatrix.multiply(modMat);
          modMat.load.from(workingMatrix);
          //modMat.multiply(matrix);
          
          if(currentMaterial) {
            currentMaterialFlush();
          }
          
          gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
          currentFramebuffer = self;
          r.width = width;
          r.height = height;
          gl.viewport(0, 0, r.width, r.height);
        },
        unbind(modMat) {
          if(currentMaterial) {
            currentMaterialFlush();
          }
          
          gl.bindFramebuffer(gl.FRAMEBUFFER, null);
          currentFramebuffer = null;
          r.width = canvas.width;
          r.height = canvas.height;
          gl.viewport(0, 0, r.width, r.height);
          modMat.load.from(originalMatrix);
        },
        draw(material) {
          let origMat = material.getMatrix();
          material.setMatrix(Mat4.identity);
          material.rect(-1.0-(width-canvas.width)/canvas.width,
                        -1.0-(height-canvas.height)/canvas.height,
                        width*2/canvas.width, height*2/canvas.height,
                        colorBufferObj);
          material.setMatrix(origMat);
        }
      };

      return self;
    },
    assetLoader() {
      let loaders = {
        texture(placeholder) {
          return AssetManager.getFile(placeholder.spec.src).then((blob) => {
            return blobToImage(blob);
          }).then((img) => {
            let texture = gl.createTexture();
            gl.bindTexture(gl.TEXTURE_2D, texture);
            gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
            //gl.generateMipmap(gl.TEXTURE_2D);
            gl.bindTexture(gl.TEXTURE_2D, null);
            return {
              glTex: texture,
              width: img.width,
              height: img.height
            };
          });
        },
        shader(placeholder) {
          if(placeholder.spec.shaderType != "fragment" && placeholder.spec.shaderType != "vertex") {
            return Promise.reject("unrecognized shader type '" + placeholder.spec.shaderType + "'");
          }
          return AssetManager.getFile(placeholder.spec.src).then((blob) => {
            return BlobUtil.blobToBinaryString(blob);
          }).then((src) => {
            let shader = gl.createShader({fragment: gl.FRAGMENT_SHADER, vertex: gl.VERTEX_SHADER}[placeholder.spec.shaderType]);
            gl.shaderSource(shader, src);
            gl.compileShader(shader);
            if(!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
              let log = gl.getShaderInfoLog(shader);
              gl.deleteShader(shader);
              throw "Could not compile shader: " + log;
            }
            
            return {
              glObject: shader,
              attributes: placeholder.spec.attributes || [],
              uniforms: placeholder.spec.uniforms || []
            };
          });
        },
        program(placeholder) {
          return Promise.all(placeholder.spec.shaders.map((id) => {
            return placeholder.depend(id);
          })).then((shaders) => {
            let program = gl.createProgram();
            for(let i = 0; i < shaders.length; i++) {
              gl.attachShader(program, shaders[i].glObject);
            }
            
            gl.linkProgram(program);
            
            if(!gl.getProgramParameter(program, gl.LINK_STATUS)) {
              let log = gl.getProgramInfoLog(program);
              gl.deleteProgram(program);
              throw "Could not link program: " + log;
            }

            let attributeList = Array.prototype.concat.apply([], shaders.map((s) => s.attributes));
            let uniformList = Array.prototype.concat.apply([], shaders.map((s) => s.uniforms));

            let attributes = {};
            let uniforms = {};
            
            attributeList.forEach((spec) => {
              spec.location = gl.getAttribLocation(program, spec.name);
              if(spec.location < 0) {
//                throw "Could not find attribtue '" + spec.name + "'";
              }
              if(attributes[spec.name]) {
                let a = attributes[spec.name];
                if(a.dataType != spec.dataType || a.components != spec.components) {
                  throw "Conflicting definitions for attribute '" + spec.name + "'";
                }
              } else {
                attributes[spec.name] = spec;
              }
            });
            
            uniformList.forEach((spec) => {
              spec.location = gl.getUniformLocation(program, spec.name);
              if(!spec.location) {
//                throw "Could not find uniform '" + spec.name + "'";
              }
              if(uniforms[spec.name]) {
                let a = uniforms[spec.name];
                if(a.dataType != spec.dataType || a.components != spec.components) {
                  throw "Conflicting definitions for uniform '" + spec.name + "'";
                }
              } else {
                uniforms[spec.name] = spec;
              }
            });
            
            return {
              program,
              attributes,
              uniforms
            };
          });
        }
      };

      return {
        canLoad(placeholder) {
          return loaders[placeholder.spec.type] != undefined;
        },
        load(placeholder) {
          return loaders[placeholder.spec.type](placeholder);
        }
      };
    },
    changeMaterial(material, flush) {
      if(currentMaterial && currentMaterial != material) {
        currentMaterialFlush();
      }
      currentMaterial = material;
      currentMaterialFlush = flush;
    },
    unbindMaterial() {
      currentMaterial = null;
    },
    flushMaterials() {
      r.changeMaterial(null);
    }
  };
  return r;
};
