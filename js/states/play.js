import BaseState from "./baseState.js";
import SpaceBackground from "../objects/spaceBackground.js";
import SkyBackground from "../objects/skyBackground.js";
import Earth from "../objects/earth.js";
import Player from "../objects/player.js";
import FadeTransition from "../transitions/fade.js";

import {Colors, Color, ColorUtils, TempColor} from "../gfxutils.js";
let obstacleColor = Color(0.3, 0.3, 0.3, 1.0);

let Obstacle = (ax1, ay1, ax2, ay2) => {
  let x1 = Math.min(ax1, ax2);
  let y1 = Math.min(ay1, ay2);
  let x2 = Math.max(ax1, ax2);
  let y2 = Math.max(ay1, ay2);
  return {
    isObstacle: true,
    x1, y1, x2, y2,
    draw(res) {
      res.shapes.setColor(obstacleColor);
      res.shapes.rect(x1, y1, x2-x1, y2-y1);
    },
  };
};

let stateFactory = (game, transition) => {
  let s;
  let self = {
    binds: {},
    scrollX: 0,
    scrollY: 0,
    scrollVX: 0.1,
    scrollVY: 0,
    inputEnabled: true,
    initialize(state) {
      s = state;
      let binds = {
        left: ["ArrowLeft", "a"],
        right: ["ArrowRight", "d"],
        up: ["ArrowUp", "w"],
        down: ["ArrowDown", "s"],
        fire: ["LeftShift", "RightShift", "z", "x"]
      }
      Object.keys(binds).forEach((key) => {
        self.binds[key] = state.keyboard.createKeybind.apply(null, binds[key]);
      });
      state.add(SpaceBackground());
      state.add(Player());
      state.add(Obstacle(-2000, 200, 2000, 2000));
      state.add(Obstacle(-2000, -200, 2000, -2000));
      state.add(Obstacle(300, 0, 600, 200));
    },
    preTick(delta, time) {
      self.scrollX+= self.scrollVX * delta;
      self.scrollY+= self.scrollVY * delta;
    },
    preDraw(res) {
      res.matrix.transform.translate(-self.scrollX, -self.scrollY);
    },
    uniformTick(time) {
      if(self.playerDead) {
        self.scrollVX*= 0.8;
      }
    },
    died() {
      self.playerDead = true;
      s.setTransition(FadeTransition(game, stateFactory));
    }
  };
  return BaseState(game, transition, self);
};

export default stateFactory;
