import BaseState from "./baseState.js";
import SpaceBackground from "../objects/spaceBackground.js";
import SkyBackground from "../objects/skyBackground.js";
import Earth from "../objects/earth.js";
import Player from "../objects/player.js";
import Turret, {resetId as resetTurretIds} from "../objects/turret.js";
import MissileTurret from "../objects/missileTurret.js";
import Glob from "../objects/glob.js";
import SpeedBooster from "../objects/speedBooster.js";
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

let checkpoints = [{
  px: -700,
  py: 0,
  sx: 0,
  svx: 0.1,
  music: 0,
  time: 0,
  turrets: [],
}, {
  px: 1700,
  py: 121,
  sx: 2187,
  svx: 0.35,
  music: 21.2,
  time: 21700,
  turrets: []
}];

let stateFactory = (game, transition, checkpointId) => {
  let s;
  let music;
  let player;
  let events = [];
  if(checkpointId === undefined) {
    checkpointId = 0;
  }
  let checkpoint = checkpoints[checkpointId];
  resetTurretIds();
  let self = {
    binds: {},
    scrollX: checkpoint.sx,
    scrollY: 0,
    scrollVX: checkpoint.svx,
    scrollVY: 0,
    scrollVXTarget: checkpoint.svx,
    inputEnabled: true,
    checkpointId,
    checkpoint,
    turretStates: checkpoint.turrets.slice(),
    initialize(state) {
      s = state;
      //s.lightingEnabled = true;
      let binds = {
        left: ["ArrowLeft", "a"],
        right: ["ArrowRight", "d"],
        up: ["ArrowUp", "w"],
        down: ["ArrowDown", "s"],
        fire: ["LeftShift", "RightShift", "z", "x"],
        dump: ["d"]
      }
      Object.keys(binds).forEach((key) => {
        self.binds[key] = state.keyboard.createKeybind.apply(null, binds[key]);
      });
      state.add(SpaceBackground());
      state.add(self.player = player = Player());
      state.add(Obstacle(-2000, 200, 4000, 2000));
      state.add(Obstacle(-2000, -200, 1800, -2000));

      state.add(Obstacle(-300, 50, 0, -50));
      state.add(Obstacle(300, 100, 600, 200));
      state.add(Turret(450, 100, "up", true));
      state.add(Turret(1000, 200, "up", true));
      state.add(Obstacle(1000, -100, 1300, -200));
      state.add(Turret(1220, -100, "down"));
      state.add(Turret(1600, -200, "down"));
      state.add(Obstacle(1500, 0, 1800, 100));
      state.add(Obstacle(1800, -350, 2300, -2000));
      state.add(Obstacle(2300, -200, 4000, -2000));
      state.add(Turret(2300, -275, "left"));
      state.add(Obstacle(2300, -275, 2400, 0));
      state.add(Obstacle(2700, 275, 2800, 0));
      state.add(Turret(2400, -150, "right"));
      state.add(Turret(2700, 150, "left", false, false));
      state.add(Obstacle(3100, -275, 3200, -50));
      state.add(Obstacle(3100, 275, 3200, 50));
      state.add(MissileTurret(3300, 200, "up"));
      state.add(MissileTurret(3350, -200, "down"));
      state.add(Obstacle(4000, 300, 8000, 2000));
      state.add(Obstacle(4000, -300, 8000, -2000));
      state.add(Turret(4550, 300, "up", true));
      state.add(Turret(4600, 300, "up", true));
      state.add(Turret(4650, 300, "up", true));
      state.add(Turret(4550, -300, "down"));
      state.add(Turret(4600, -300, "down"));
      state.add(Turret(4650, -300, "down"));
      state.add(Obstacle(4700, -300, 5200, -50));
      state.add(Obstacle(4700, 300, 5200, 50));
      state.add(MissileTurret(5300, -300, "down"));
      state.add(MissileTurret(5300, 300, "up"));
      state.add(MissileTurret(5380, -300, "down"));
      state.add(MissileTurret(5380, 300, "up"));
      state.add(Obstacle(5700, -300, 5800, -50));
      state.add(Obstacle(5700, 300, 5800, 50));
      state.add(Turret(5800, -150, "right", true, 2.0));
      state.add(Obstacle(6000, -50, 6300, 300));
      state.add(Obstacle(6050, -100, 6300, 300));
      state.add(Turret(6000, 200, "left"));
      state.add(Obstacle(7000, -300, 7050, -40));
      state.add(Obstacle(7000, 300, 7050, 40));
      state.add(Glob(7025, 0));
      state.add(SpeedBooster(7050));
      state.add(Obstacle(7050, 200, 7800, 2000));
      state.add(Obstacle(7050, -200, 7800, -2000));
      state.add(MissileTurret(7050, -100, "right", true));
      state.add(MissileTurret(7050, 100, "right", true));
      state.add(MissileTurret(7200, 200, "up", true));
      state.add(MissileTurret(7200, -200, "down", true));
      state.add(MissileTurret(7300, 200, "up", true));
      state.add(MissileTurret(7300, -200, "down", true));
      state.add(MissileTurret(7400, 200, "up", true));
      state.add(MissileTurret(7400, -200, "down", true));
      state.add(MissileTurret(7500, 200, "up", true));
      state.add(MissileTurret(7500, -200, "down", true));
      state.add(MissileTurret(7600, 200, "up", true));
      state.add(MissileTurret(7600, -200, "down", true));
      state.add(MissileTurret(7700, 200, "up", true));
      state.add(MissileTurret(7700, -200, "down", true));
      state.add(Obstacle(8100, 400, 12000, 2000));
      state.add(Obstacle(8100, -400, 12000, -2000));
      state.add(Obstacle(8800, -300, 9000, 300));
      
      //10800

      player.x = checkpoint.px;
      player.y = checkpoint.py;
      
      window.setTimeout(() => {
        music = state.game.sound.playMusic(AssetManager.getAsset("game.music"));
        music.element.currentTime = checkpoint.music;
        self.music = music;
      }, 500);

      events.push({
        time: 21700,
        call: () => {
          self.scrollVXTarget = 0.35;
          self.setCheckpoint(1);
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
    setCheckpoint(num) {
      self.checkpointId = num;
      checkpoints[num].turrets = self.turretStates;
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
    draw(res) {
      res.matStack.push(res.matrix);
      res.matrix.transform.translate(self.scrollX, self.scrollY);
      res.matrix.transform.scale(3);
      res.font.setColor(Colors.WHITE);
      //res.font.draw(self.player.x.toString(), -200, -100, 0, true);
      res.matStack.pop(res.matrix);
    },
    uniformTick(time) {
      if(self.playerDead) {
        self.scrollVX*= 0.8;
      }
    },
    tick(delta, time) {
      for(let i = 0; i < events.length; i++) {
        if(time - checkpoint.time > events[i].time && !events[i].activated) {
          events[i].activated = true;
          events[i].call();
        }
      }
    },
    died() {
      self.playerDead = true;
      s.setTransition(FadeTransition(game, (game, transition) => {return stateFactory(game, transition, self.checkpointId)}));
      if(music) {
        music.fadeOut();
      }
      s.game.sound.playSound(AssetManager.getAsset("game.sfx.boom"));
    }
  };
  return BaseState(game, transition, self);
};

export default stateFactory;
