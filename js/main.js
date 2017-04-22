import {WebGLRenderer} from "./webgl.js";
import {PreloaderState} from "./states/preloader.js";
import PlayState from "./states/play.js";
import RunAndGunDemoState from "./states/runandgundemo.js";
import {AssetManager} from "./assetmgr.js";
import {SoundEngine} from "./sound.js";
import {FontLoader} from "./font.js";

let game = {};
window.theGame = game;

window.onload = () => {
  let clickState = false;
  let lastClickState = false;

  try {
    let canvas = document.getElementById("gamecanvas");
    game.render = WebGLRenderer(game, canvas, canvas.getContext("webgl", {
      alpha: true,
      stencil: true
    }) || canvas.getContext("experimental-webgl", {
      alpha: true,
      stencil: true
    }));
    game.sound = SoundEngine(game);
    game.mouse = {
      x: 0, y: 0,
      justClicked() {
        return clickState && !lastClickState;
      }
    };
    
    game.switchState = (newstate) => {
      if(game.state && game.state.destroy) {
        game.state.destroy();
      }
      game.state = newstate;
      if(newstate.initialize) {
        newstate.initialize();
      }
    };
    
    game.switchState(PreloaderState(game, PlayState));
    
    AssetManager.addAssetLoader(game.render.assetLoader());
    AssetManager.addAssetLoader(game.sound.createAssetLoader());
    AssetManager.addAssetLoader(FontLoader);
  } catch(err) {
    document.write(err);
    return;
  }
  
  let lastTick = performance.now();
  let lastFrameDone = 0;
  game.tick = (timestamp) => {
    let delta = timestamp - lastTick;
    lastTick = timestamp;

    game.render.prepareFrame();
    
    if(game.state && game.state.tick) {
      game.state.tick(delta);
    }

    if(game.state && game.state.getKeyboard) {
      game.state.getKeyboard().update();
    }

    lastClickState = clickState;

    game.render.finalizeFrame();
    
    window.requestAnimationFrame(game.tick);
    
    lastFrameDone = performance.now();
  };
  window.requestAnimationFrame(game.tick);

  document.addEventListener("keydown", (evt) => {
    if(game.state && game.state.getKeyboard) {
      game.state.getKeyboard().keyDown(evt);
    }
  });

  document.addEventListener("keyup", (evt) => {
    if(game.state && game.state.getKeyboard) {
      game.state.getKeyboard().keyUp(evt);
    }
  });

  document.addEventListener("mousemove", (evt) => {
    game.mouse.x = evt.clientX;
    game.mouse.y = evt.clientY;
  });

  document.addEventListener("mousedown", (evt) => {
    clickState = true;
  });
  document.addEventListener("mouseup", (evt) => {
    clickState = false;
  });
};
