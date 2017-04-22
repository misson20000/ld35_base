import {AssetManager} from "../assetmgr.js";
import {Colors, Color} from "../gfxutils.js";
import {Mat4, Mat4Stack} from "../math.js";
import FlatColorMaterial from "../material/flatColor.js";
import FontRenderer from "../font.js";

export default (game, state, fadeDuration, pauseDuration, preDelay) => {
  if(preDelay === undefined) {
    preDelay = 300;
  }
  if(fadeDuration === undefined) {
    fadeDuration = 100;
  }
  if(pauseDuration === undefined) {
    pauseDuration = 500;
  }

  let r = game.render;
  let matrix = Mat4.create();
  let shapes = FlatColorMaterial(r, AssetManager.getAsset("base.shader.flat.color"));
  shapes.setMatrix(matrix);

  let time = -preDelay;
  let tempColor = Color(0, 0, 0, 0);
  let transitioned = false;
  
  let self = (delta) => {
    time+= delta;
    if(time < 0) {
      return;
    }
    if(time < fadeDuration) {
      shapes.setColor(tempColor);
      tempColor.a = time / fadeDuration;
      shapes.rect(-1, -1, 2, 2);
      return;
    }
    if(!transitioned) {
      game.switchState(state(game, self));
      transitioned = true;
    }
    if(time < fadeDuration + pauseDuration) {
      shapes.setColor(tempColor);
      tempColor.a = 1;
      shapes.rect(-1, -1, 2, 2);
      return;
    }
    if(time < fadeDuration*2 + pauseDuration) {
      shapes.setColor(tempColor);
      tempColor.a = (fadeDuration * 2 + pauseDuration - time) / fadeDuration;
      shapes.rect(-1, -1, 2, 2);
    }
  };
  return self;
}
