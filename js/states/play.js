import {AssetManager} from "../assetmgr.js";
import {Colors, Color, ColorUtils, TempColor} from "../gfxutils.js";
import {Mat4, Mat4Stack, lerp, invlerp, modulo} from "../math.js";
import {Keyboard} from "../keyboard.js";
import {colors} from "../palette.js";
import FlatColorMaterial from "../material/flatColor.js";
import TexturedMaterial from "../material/textured.js";
import LightsMaterial from "../material/lights.js";
import FontRenderer from "../font.js";

export let PlayState = (game, transition) => {
  let time = 0;
  
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
  
  let particles = [];
  let tempColor = Color(1, 1, 1, 1);

  let fb = r.createFramebuffer(50);
  
  let self = {
    binds: {
      left: kb.createKeybind("ArrowLeft", "a"),
      right: kb.createKeybind("ArrowRight", "d"),
      up: kb.createKeybind("ArrowUp", "w"),
      down: kb.createKeybind("ArrowDown", "s")
    },
    initialize() {
      console.log("initialize play state");
      for(let i = 0; i < 15000; i++) {
        let angle = Math.random() * Math.PI;
        let mag = Math.random();
        particles[i] = {
          x: r.width/2,
          y: r.height/2,
          xv: 100 * Math.cos(angle) * mag,
          yv: 100 * -Math.sin(angle) * mag,
          ttl: Math.random()
        };
      }
    },
    tick(delta) {
      r.clear(Colors.BLACK);

      matStack.reset();
      matrix.load.identity();
      matrix.transform.translate(-1, 1);
      matrix.transform.scale(2.0/r.cwidth, -2.0/r.cheight);
      
      for(let x = 0; x < r.cwidth; x+= 20) {
        for(let y = 0; y < r.cheight; y+= 20) {
          shapes.setColor((x + y) % 40 == 0 ? colors.checkerA : colors.checkerB);
          shapes.rect(x, y, 20, 20);
        }
      }
      font.setColor(Colors.WHITE);

      //set up context for lighting
      fb.bind(matrix);
      r.clear(Colors.BLACK);
      if(gl_minmax) {
        gl.blendEquation(gl_minmax.MAX_EXT);
      } else {
        gl.blendEquation(gl.FUNC_ADD);
      }
      gl.blendFunc(gl.ONE, gl.ONE);

      shapes.setColor(TempColor(1, 1, 1, 0.1));
      shapes.rect(0, 0, r.cwidth, r.cheight);
      
      //set up context for compositing
      fb.unbind(matrix);
      
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
