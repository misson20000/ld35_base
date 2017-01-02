import {AssetManager} from "../assetmgr.js";
import {Colors} from "../gfxutils.js";

import {LoaderState} from "./loader.js";

export let PreloaderState = (game) => {
  let render = game.render;

  let time = 0;

  let promise;
  
  return {
    initialize() {
      promise = AssetManager.downloadAssetGroup("base");
      promise.then(() => {
        console.log("loaded base.asgroup, switching state");
        game.switchState(LoaderState(game));
      }, (err) => {
        console.log("failed to load assets: " + err);
      });
    },
    tick(delta) { // variable framerate
      time+= delta;
      render.clear(Colors.BLUE);
    }
  };
};
