import {AssetManager} from "../assetmgr.js";
import {Colors, Color, ColorUtils, TempColor} from "../gfxutils.js";
import {Mat4, Mat4Stack, lerp, invlerp, modulo} from "../math.js";
import {Keyboard} from "../keyboard.js";
import FlatColorMaterial from "../material/flatColor.js";
import TexturedMaterial from "../material/textured.js";
import LightsMaterial from "../material/lights.js";
import FontRenderer from "../font.js";

export default (game, transition) => {
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
  
  let self = {
    game,
    tick(delta) {
      drawingResources.t = time;
      drawingResources.delta = delta;

      r.clear(Colors.BLACK);
      
      matStack.reset();
      matrix.load.identity();
      matrix.transform.translate(-1, 1);
      matrix.transform.scale(2.0/r.cwidth, -2.0/r.cheight);
      matrix.transform.translateFloor(r.cwidth/2, r.cheight/2);

      matrix.transform.scale(10);
      font.drawCenteredX("Victorious!", 0, 0, 0);
    },
    getKeyboard() {
      return kb;
    }
  };
  return self;
};
