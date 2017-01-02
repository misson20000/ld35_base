import {AssetManager} from "../assetmgr.js";
import {Colors, Color} from "../gfxutils.js";
import {Mat4, Mat4Stack} from "../math.js";
import {DiamondTransition} from "../transitions.js";
import {PlayState} from "./play.js";

export let LoaderState = (game) => {
  let r = game.render;
  let opMatrix = Mat4.create();
  let matrix = Mat4.create();
  let matStack = Mat4Stack.create();
  
  let time = 0;

  let backgroundColor = Color("#422D24");
  let foregroundColor = Color("#241711");

  let status = "loading";
  
  return {
    initialize() {
      AssetManager.downloadAssetGroup("lights").then(() => {
        status = "loaded";
        game.switchState(PlayState(game));
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
      matStack.push(matrix);
    }
  };
};
