import BaseState from "./baseState.js";
import SpaceBackground from "../objects/spaceBackground.js";
import SkyBackground from "../objects/skyBackground.js";
import Earth from "../objects/earth.js";
import Player from "../objects/player.js";
import Turret from "../objects/turret.js";
import MissileTurret from "../objects/missileTurret.js";
import FadeTransition from "../transitions/fade.js";

import {Colors, Color, ColorUtils, TempColor} from "../gfxutils.js";
import {AssetManager} from "../assetmgr.js";

let obstacleColor = Color(0.1, 0.1, 0.1, 1.0);

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
  let music;
  let player;
  let events = [];
  let self = {
    binds: {},
    scrollX: 0,
    scrollY: 0,
    scrollVX: 0.1,
    scrollVY: 0,
    scrollVXTarget: 0.1,
    inputEnabled: true,
    initialize(state) {
      s = state;
      //s.lightingEnabled = true;
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
      state.add(self.player = player = Player());
      state.add(Obstacle(-2000, 200, 20000, 2000));
      state.add(Obstacle(-2000, -200, 1800, -2000));

      /*
      state.add(Obstacle(300, 0, 600, 200));
      state.add(Turret(1000, 200, "up"));
      state.add(Obstacle(1000, 0, 1300, -200));
      state.add(Turret(1600, -200, "down"));
      state.add(Obstacle(1800, -350, 2300, -2000));
      state.add(Obstacle(2300, -200, 4000, -2000));
      state.add(Turret(2300, -275, "left"));
      state.add(Obstacle(2300, -275, 2400, 0));
      state.add(Obstacle(2700, 275, 2800, 0));
      state.add(Turret(2400, -150, "right"));
      state.add(Turret(2700, 150, "left"));
      state.add(Obstacle(3100, -275, 3200, 0));
      */

      state.add(MissileTurret(1000, 200, "up"));
      
      window.setTimeout(() => {
        music = state.game.sound.playMusic(AssetManager.getAsset("game.music"));
      }, 500);

      events.push({
        time: 21700,
        call: () => {
          self.scrollVXTarget = 0.35;
        }
      });
    },
    preTick(delta, time) {
      self.scrollX+= self.scrollVX * delta;
      self.scrollY+= self.scrollVY * delta;
      if(self.scrollVX < self.scrollVXTarget) {
        self.scrollVX+= delta / 1000.0;
        if(self.scrollVX > self.scrollVXTarget) {
          self.scrollVX = self.scrollVXTarget;
        }
      }
      if(self.scrollVX > self.scrollVXTarget) {
        self.scrollVX-= delta / 1000.0;
        if(self.scrollVX < self.scrollVXTarget) {
          self.scrollVX = self.scrollVXTarget;
        }
      }
    },
    preDraw(res) {
      res.matrix.transform.translate(-self.scrollX, -self.scrollY);
      //res.matrix.transform.scale(0.2);
    },
    preLights(res) {
      res.shapes.setColor(TempColor(1, 1, 1, 0.7));
      res.shapes.rect(-res.r.cwidth/2, -res.r.cheight/2, res.r.cwidth, res.r.cheight);
      res.matrix.transform.translate(-self.scrollX, -self.scrollY);
    },
    uniformTick(time) {
      if(self.playerDead) {
        self.scrollVX*= 0.8;
      }
    },
    tick(delta, time) {
      for(let i = 0; i < events.length; i++) {
        if(time > events[i].time && !events[i].activated) {
          events[i].activated = true;
          events[i].call();
        }
      }
    },
    died() {
      self.playerDead = true;
      s.setTransition(FadeTransition(game, stateFactory));
      if(music) {
        music.fadeOut();
      }
      s.game.sound.playSound(AssetManager.getAsset("game.sfx.boom"));
    }
  };
  return BaseState(game, transition, self);
};

export default stateFactory;
