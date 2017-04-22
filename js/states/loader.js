import {AssetManager} from "../assetmgr.js";
import {Colors, Color} from "../gfxutils.js";
import {Mat4, Mat4Stack} from "../math.js";
import FlatColorMaterial from "../material/flatColor.js";
import FontRenderer from "../font.js";
import FadeTransition from "../transitions/fade.js";

export let LoaderState = (game, finalState) => {
  let r = game.render;
  let matrix = Mat4.create();
  let matStack = Mat4Stack.create();
  
  let time = 0;

  let backgroundColor = Color("#121212");
  let foregroundColor = Color("#241711");

  let status = "loading";
  let font = FontRenderer(r, AssetManager.getAsset("base.font.coders_crux"));
  let shapes = FlatColorMaterial(r, AssetManager.getAsset("base.shader.flat.color"));
  font.setMatrix(matrix);
  shapes.setMatrix(matrix);

  let transition = null;
  let done = false;
  
  return {
    initialize() {
      Promise.all(["lights", "game"].map((group) => AssetManager.downloadAssetGroup(group))).then(() => {
        status = "loaded";
        transition = FadeTransition(game, finalState);
        done = time;
      }, (err) => {
        console.log("failed to load assets: " + err);
        errored = true;
        error = err;
      });
    },
    tick(delta) {
      r.clear(backgroundColor);
      
      matStack.reset();
      matrix.load.identity();
      matrix.transform.translate(-1, 1);
      matrix.transform.scale(2.0/r.cwidth, -2.0/r.cheight);
      matrix.transform.translateFloor(r.cwidth/2, r.cheight/2);
      matStack.push(matrix);

      time+= delta;
      matrix.transform.scale(3);
      font.drawCenteredX("Loading Assets", 0, 0, 0, true);
      matStack.peek(matrix);

      let progress = done ? (time - done)/100.0 : 0;
      let w = font.width("Loading Assets") * 3 * Math.min(1.0, progress);
      
      shapes.setColor(Colors.GREEN);
      shapes.rect(-w/2, font.height() * 3 + 8, w, 3);

      if(transition) {
        transition(delta);
      }
    }
  };
};
