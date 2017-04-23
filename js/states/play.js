import BaseState from "./baseState.js";
import SpaceBackground from "../objects/spaceBackground.js";
import SkyBackground from "../objects/skyBackground.js";
import Earth from "../objects/earth.js";
import Player from "../objects/player.js";
import Turret, {resetId as resetTurretIds} from "../objects/turret.js";
import MissileTurret from "../objects/missileTurret.js";
import Glob from "../objects/glob.js";
import SpeedBooster from "../objects/speedBooster.js";
import HTrigger from "../objects/hTrigger.js";
import FadeTransition from "../transitions/fade.js";

import {Colors, Color, ColorUtils, TempColor} from "../gfxutils.js";
import {AssetManager} from "../assetmgr.js";

let obstacleColor = Color(0.2, 0.2, 0.2, 1.0);

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
  time: 20700,
  turrets: []
}, {
  px: 10100,
  py: 0,
  sx: 10347,
  svx: 0.45,
  music: 42.41,
  time: 42400,
  turrets: []
}, {
  px: 18600,
  py: 0,
  sx: 18788,
  svx: 1.0,
  music: 58.30,
  time: 57800,
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
      state.add(Obstacle(4700, -300, 4900, -50));
      state.add(Obstacle(4700, 300, 4900, 50));
      state.add(Turret(4950, 300, "up", true));
      state.add(Turret(5000, 300, "up", true));
      state.add(Turret(5050, 300, "up", true));
      state.add(Turret(4950, -300, "down"));
      state.add(Turret(5000, -300, "down"));
      state.add(Turret(5050, -300, "down"));
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

      /*state.add(Turret(6650, 300, "up", true));
      state.add(Turret(6700, 300, "up", true));
      state.add(Turret(6750, 300, "up", true));
      state.add(Turret(6650, -300, "down"));
      state.add(Turret(6700, -300, "down"));
      state.add(Turret(6750, -300, "down"));*/
      
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


      state.add(Turret(8550, 400, "up", true));
      state.add(Turret(8600, 400, "up", true));
      state.add(Turret(8650, 400, "up", true));
      state.add(Turret(8550, -400, "down"));
      state.add(Turret(8600, -400, "down"));
      state.add(Turret(8650, -400, "down"));
      
      state.add(Obstacle(8100, 400, 10320, 2000));
      state.add(Obstacle(8100, -400, 10320, -2000));
      state.add(Obstacle(8800, -300, 9000, 300));

      state.add(MissileTurret(9200, 400, "up", true));
      state.add(MissileTurret(9300, 400, "up", true));
      state.add(MissileTurret(9400, 400, "up", true));
      state.add(MissileTurret(9500, 400, "up", true));
      state.add(MissileTurret(9600, 400, "up", true));
      state.add(MissileTurret(9700, 400, "up", true));

      // checkpoint 2
      
      //10320
      let TurretCluster = (x, y, type) => {
        state.add(Obstacle(x-80, y-80, x+80, y+80));
        state.add(type(x-80, y-40, "left"));
        state.add(type(x-80, y+40, "left"));
        state.add(type(x+80, y-40, "right"));
        state.add(type(x+80, y+40, "right"));
        state.add(type(x-40, y-80, "up"));
        state.add(type(x+40, y-80, "up"));
        state.add(type(x-40, y+80, "down"));
        state.add(type(x+40, y+80, "down"));
      };

      TurretCluster(11980, -100, Turret);
      TurretCluster(12480, -220, MissileTurret);
      TurretCluster(12980, 100, Turret);
      TurretCluster(13800, 100, Turret);
      TurretCluster(14000, 350, Turret);

      TurretCluster(14400, 0, MissileTurret);
      TurretCluster(14800, -200, Turret);
      TurretCluster(15400, -250, Turret);
      TurretCluster(15600, 250, Turret);
      TurretCluster(16400, -250, Turret);
      TurretCluster(16600, 250, Turret);
      
      // checkpoint 3
      state.add(Obstacle(18000, -400, 24000, -2000));
      state.add(Obstacle(18000, 400, 24000, 2000));
      state.add(Obstacle(18500, -40, 18550, -400));
      state.add(Obstacle(18500, 40, 18550, 400));
      state.add(Glob(18525, 0));
      state.add(HTrigger(18550, () => {
        self.scrollVXTarget = 0.33;
        self.scrollVX = 1.0;
        self.setCheckpoint(3);
      }));
      
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
      events.push({
        time: 42400,
        call: () => {
          self.scrollVXTarget = 0.5;
          self.scrollVX = 0.75;
          self.setCheckpoint(2);
        },
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
      if(num > self.checkpointId) {
        self.checkpointId = num;
        checkpoints[num].turrets = self.turretStates;
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
        if(time + checkpoint.time > events[i].time && !events[i].activated) {
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
