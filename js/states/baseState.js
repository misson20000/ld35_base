import {AssetManager} from "../assetmgr.js";
import {Colors, Color, ColorUtils, TempColor} from "../gfxutils.js";
import {Mat4, Mat4Stack, lerp, invlerp, modulo} from "../math.js";
import {Keyboard} from "../keyboard.js";
import FlatColorMaterial from "../material/flatColor.js";
import TexturedMaterial from "../material/textured.js";
import LightsMaterial from "../material/lights.js";
import FontRenderer from "../font.js";

export default (game, transition, behaviour) => {
  let time = 0;
  let uniformTime = 0;
  let uniformTickTimer = 0;

  let r = game.render;
  let gl = r.gl;
  let gl_minmax = gl.getExtension("EXT_blend_minmax");
  
  let kb = Keyboard.create();

  let shapes = FlatColorMaterial(r, AssetManager.getAsset("base.shader.flat.color"));
  let textures = TexturedMaterial(r, AssetManager.getAsset("base.shader.flat.texcolor"));
  let lights = LightsMaterial(r);
  let font = FontRenderer(r, AssetManager.getAsset("base.font.coders_crux"));
  
  let matStack = Mat4Stack.create();
  let matrix = Mat4.create();
  shapes.setMatrix(matrix);
  textures.setMatrix(matrix);
  font.setMatrix(matrix);
  lights.setMatrix(matrix);
  
  let tempColor = Color(1, 1, 1, 1);

  let fb = r.createFramebuffer(50);
  
  let drawingResources = {
    r, gl, shapes, textures, lights, font, matStack, matrix, state: self
  };
  
  let objects = [];
  let shake = 0;
  
  let self = {
    game,
    objects,
    behaviour,
    keyboard: kb,
    add(object) {
      objects.push(object);
      if(object.initialize) {
        object.initialize(self, behaviour);
      }
    },
    remove(object) {
      object.toBeRemoved = true;
    },
    initialize() {
      behaviour.initialize(self);
    },
    shake(intensity) {
      shake+= intensity;
    },
    tick(delta) {
      time+= delta;
      drawingResources.t = time;
      drawingResources.delta = delta;

      self.performUniformTicks(delta);
      self.performTick(delta);
      self.removeObjects();
      self.setupFrame();
      self.drawColors();
      if(self.lightingEnabled) {
        self.drawLights();
        self.doLighting();
      }

      if(transition) {
        transition(delta);
      }
    },
    performTick(delta) {
      if(behaviour.preTick) {
        behaviour.preTick(delta, time);
      }

      for(let i = 0; i < objects.length; i++) {
        if(objects[i].tick) {
          objects[i].tick(delta, time);
        }
      }

      if(behaviour.tick) {
        behaviour.tick(delta, time);
      }
    },
    performUniformTicks(delta) {
      uniformTickTimer+= delta;
      while(uniformTickTimer > 5) {
        uniformTime+= 5;

        if(behaviour.uniformPreTick) {
          behaviour.uniformPreTick(uniformTime);
        }

        for(let i = 0; i < objects.length; i++) {
          if(objects[i].uniformTick) {
            objects[i].uniformTick(uniformTime);
          }
        }

        if(behaviour.uniformTick) {
          behaviour.uniformTick(uniformTime);
        }
        
        shake*= 0.95;
        uniformTickTimer-= 5;
      }
    },
    removeObjects() {
      for(let i = 0; i < objects.length; i++) {
        if(objects[i].toBeRemoved) {
          objects.splice(i, 1);
          i--;
        }
      }
    },
    setupFrame() {
      r.clear(Colors.BLACK);

      matStack.reset();
      matrix.load.identity();
      matrix.transform.translate(-1, 1);
      matrix.transform.scale(2.0/r.cwidth, -2.0/r.cheight);
      matrix.transform.translateFloor(r.cwidth/2, r.cheight/2);
      matrix.transform.translate((Math.random() * 2 - 1) * shake, (Math.random() * 2 - 1) * shake);
    },
    drawColors() {
      if(behaviour.preDraw) {
        behaviour.preDraw(drawingResources);
      }
      
      for(let i = 0; i < objects.length; i++) {
        matStack.push(matrix);
        if(objects[i].draw) {
          objects[i].draw(drawingResources);
        }
        matStack.pop(matrix);
      }

      if(behaviour.draw) {
        behaviour.draw(drawingResources);
      }
    },
    drawLights() {
      //set up context for lighting
      fb.bind(matrix);
      r.clear(Colors.BLACK);
      if(gl_minmax) {
        gl.blendEquation(gl_minmax.MAX_EXT);
      } else {
        gl.blendEquation(gl.FUNC_ADD);
      }
      gl.blendFunc(gl.ONE, gl.ONE);
      
      for(let i = 0; i < objects.length; i++) {
        matStack.push(matrix);
        if(objects[i].drawLights) {
          objects[i].drawLights(drawingResources);
        }
        matStack.pop(matrix);
      }
      
      fb.unbind(matrix);      
    },
    doLighting() {
      r.flushMaterials();
      textures.setColor(Colors.WHITE);
      gl.blendEquation(gl.FUNC_ADD);
      gl.blendFunc(gl.DST_COLOR, gl.ZERO); // src * dest for compositing
      fb.draw(textures); // we already have the colors in our frame buffer, so we just need to multiply by the lights
    },
    getKeyboard() {
      return kb;
    }
  };
  return self;
};
