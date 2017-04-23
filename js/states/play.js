import BaseState from "./baseState.js";
import SpaceBackground from "../objects/spaceBackground.js";
import SkyBackground from "../objects/skyBackground.js";
import Earth from "../objects/earth.js";
import Player from "../objects/player.js";
import Turret from "../objects/turret.js";
import MissileTurret from "../objects/missileTurret.js";
import Glob from "../objects/glob.js";
import SpeedBooster from "../objects/speedBooster.js";
import HTrigger from "../objects/hTrigger.js";
import {SmallExplosion, MediumExplosion, LargeExplosion} from "../objects/explosions.js";
import FadeTransition from "../transitions/fade.js";
import {Colors, Color, ColorUtils, TempColor} from "../gfxutils.js";
import {AssetManager} from "../assetmgr.js";
import winState from "./win.js";

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

let Breakable = (ax1, ay1, ax2, ay2) => {
  let x1 = Math.min(ax1, ax2);
  let y1 = Math.min(ay1, ay2);
  let x2 = Math.max(ax1, ax2);
  let y2 = Math.max(ay1, ay2);
  let s, b;
  let self = {
    isObstacle: true,
    x1: x1-5, y1: y1-10, x2: x2+5, y2: y2+10,
    initialize(state, behaviour) {
      s = state;
      b = behaviour;
      self.id = b.enemyId++;
      if(b.checkpoint.enemies[self.id]) {
        self.toBeRemoved = true;
      }
    },
    draw(res) {
      res.shapes.setColor(obstacleColor);
      res.shapes.rect(x1, y1, x2-x1, y2-y1);
      res.textures.setColor(Colors.BLACK);
      res.textures.rect(x1, y1, x2-x1, y2-y1, AssetManager.getAsset("game.cracks"));
    },
    hitByBullet(bu, delta) {
      console.log("hit by bullet");
      if(bu.isMissile) {
        self.toBeRemoved = true;
        b.enemyStates[self.id] = true;
        s.add(LargeExplosion((ax1+ax2)/2, (ay1+ay2/2)));
      }
      return true;
    },
  };
  return self;
};

let checkpoints = [{
  px: -700,
  py: 0,
  sx: 0,
  svx: 0.1,
  music: 0,
  time: 0,
  enemies: [],
}, {
  px: 1700,
  py: 121,
  sx: 2187,
  svx: 0.35,
  music: 22.57,
  time: 20700,
  enemies: []
}, {
  px: 10100,
  py: 0,
  sx: 10347,
  svx: 0.45,
  music: 45.1,
  time: 42400,
  enemies: []
}, {
  px: 18600,
  py: 0,
  sx: 18788,
  svx: 0.25,
  music: 61.90,
  time: 57800,
  enemies: []
}, {
  px: 22400,
  py: 175,
  sx: 22800,
  svx: 0.2,
  music: 73.27,
  time: 68430,
  enemies: []
}, {
  px: 27050,
  py: -90,
  sx: 27200,
  svx: 0.3,
  music: 84.6,
  time: 81734,
  enemies: []
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
  let self = {
    binds: {},
    enemyId: 0,
    scrollX: checkpoint.sx,
    scrollY: 0,
    scrollVX: checkpoint.svx,
    scrollVY: 0,
    scrollVXTarget: checkpoint.svx,
    inputEnabled: true,
    checkpointId,
    checkpoint,
    enemyStates: checkpoint.enemies.slice(),
    initialize(state) {
      s = state;
      //s.lightingEnabled = true;
      let binds = {
        left: ["ArrowLeft", "a"],
        right: ["ArrowRight", "d"],
        up: ["ArrowUp", "w"],
        down: ["ArrowDown", "s"],
        fire: ["LeftShift", "RightShift", "z", "x", "h", " ", "j", ",", "."],
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
      state.add(Glob(7025, 0));
      state.add(SpeedBooster(7050));
      state.add(Obstacle(7050, 200, 7800, 2000));
      state.add(Obstacle(7050, -200, 7800, -2000));
      state.add(MissileTurret(7050, -100, "right"));
      state.add(MissileTurret(7050, 100, "right"));
      state.add(MissileTurret(7200, 200, "up"));
      state.add(MissileTurret(7200, -200, "down"));
      state.add(MissileTurret(7300, 200, "up"));
      state.add(MissileTurret(7300, -200, "down"));
      state.add(MissileTurret(7400, 200, "up"));
      state.add(MissileTurret(7400, -200, "down"));
      state.add(MissileTurret(7500, 200, "up"));
      state.add(MissileTurret(7500, -200, "down"));
      state.add(MissileTurret(7600, 200, "up"));
      state.add(MissileTurret(7600, -200, "down"));
      state.add(MissileTurret(7700, 200, "up"));
      state.add(MissileTurret(7700, -200, "down"));
      state.add(Turret(8550, 400, "up", true));
      state.add(Turret(8600, 400, "up", true));
      state.add(Turret(8650, 400, "up", true));
      state.add(Turret(8550, -400, "down"));
      state.add(Turret(8600, -400, "down"));
      state.add(Turret(8650, -400, "down"));
      state.add(Obstacle(8100, 400, 10320, 2000));
      state.add(Obstacle(8100, -400, 10320, -2000));
      state.add(Obstacle(8800, -300, 9000, 300));
      state.add(MissileTurret(9200, 400, "up"));
      state.add(MissileTurret(9300, 400, "up"));
      state.add(MissileTurret(9400, 400, "up"));
      state.add(MissileTurret(9500, 400, "up"));
      state.add(MissileTurret(9600, 400, "up"));
      state.add(MissileTurret(9700, 400, "up"));

      // checkpoint 2
      let TurretCluster = (x, y, type, slow) => {
        state.add(Obstacle(x-80, y-80, x+80, y+80));
        state.add(type(x-80, y-40, "left", slow));
        state.add(type(x-80, y+40, "left", slow));
        state.add(type(x+80, y-40, "right", slow));
        state.add(type(x+80, y+40, "right", slow));
        state.add(type(x-40, y-80, "up", slow));
        state.add(type(x+40, y-80, "up", slow));
        state.add(type(x-40, y+80, "down", slow));
        state.add(type(x+40, y+80, "down", slow));
      };


      TurretCluster(11980, -100, Turret);
      TurretCluster(12480, -220, MissileTurret);
      TurretCluster(13800, 100, Turret);
      TurretCluster(14000, 350, MissileTurret);
      TurretCluster(14400, 0, Turret);
      TurretCluster(14800, -200, Turret);
      TurretCluster(15600, 250, Turret);
      TurretCluster(16400, -250, MissileTurret);
      
      // checkpoint 3
      state.add(Obstacle(18000, -400, 24000, -2000));
      state.add(Obstacle(18000, 400, 24000, 2000));
      state.add(Obstacle(18500, -180, 18550, -400));
      state.add(Obstacle(18500, -100, 18550, 400));
      state.add(Glob(18525, -140));
      state.add(HTrigger(18550, () => {
        self.scrollVXTarget = 0.25;
        self.scrollVX = 1.0;
        self.setCheckpoint(3);
      }));
      state.add(MissileTurret(18550, -240, "right"));
      state.add(MissileTurret(18550, 0, "right"));
      state.add(Glob(19425, 0));
      state.add(Obstacle(19400, -40, 20000, -400));
      state.add(Obstacle(19400, 40, 20000, 400));
      state.add(Obstacle(20400, -100, 20800, 400));
      state.add(Obstacle(20000, 250, 20400, 400));
      state.add(Turret(20400, 140, "left"));
      state.add(Turret(20000, -340, "right"));
      state.add(Obstacle(21200, -400, 21800, 250));
      state.add(Turret(21200, 200, "left"));
      state.add(Obstacle(22200, 250, 22800, 400));
      state.add(Turret(21800, -350, "right"));
      state.add(Turret(21800, -250, "right"));
      state.add(Turret(21800, -150, "right"));
      state.add(Turret(21800, -50, "right"));
      state.add(Turret(21800, 50, "right"));
      state.add(Obstacle(22400, -400, 22800, 150));

      // checkpoint 4
      state.add(HTrigger(22800, () => {
        self.scrollVXTarget = 0.2;
        self.scrollVX = 2;
        self.setCheckpoint(4);
      }));
      state.add(Obstacle(22800, -400, 28000, -2000));
      state.add(Obstacle(22800, 400, 28000, 2000));
      for(let x = 22880; x < 24800; x+= 100) {
        state.add(Turret(x, -400, "down"));
        state.add(Turret(x, 400, "up"));
      }
      state.add(Obstacle(24830, -400, 24880, -300));
      state.add(Obstacle(24830, 400, 24880, 300));
      //state.add(MissileTurret(24880, -360, "right", true));
      //state.add(MissileTurret(24880, 360, "right", true));
      state.add(MissileTurret(24920, -400, "down", true));
      state.add(MissileTurret(24920, 400, "up", true));
      //state.add(Obstacle(24830, -320, 24950, -300));
      //state.add(Obstacle(24830, 320, 24950, 300));
      
      state.add(Breakable(25700, -50, 25800, 50));
      state.add(Obstacle(25700, -50, 26000, -400));
      state.add(Obstacle(25700, 50, 26000, 400));

      state.add(Obstacle(26000, -35, 26050, -400));
      state.add(Obstacle(26000, 35, 26050, 400));
      state.add(Glob(26025, 0));

      state.add(Breakable(26900, -150, 27000, -50));
      state.add(Obstacle(26900, -150, 27000, -400));
      state.add(Obstacle(26900, -50, 27000, 400));
      state.add(MissileTurret(26050, -200, "right", true));
      state.add(MissileTurret(26050, -300, "right", true));
      state.add(MissileTurret(26050, 200, "right", true));
      state.add(MissileTurret(26050, 300, "right", true));
      state.add(HTrigger(27000, () => {
        self.scrollVX = 1.2;
        self.scrollVXTarget = 0.5;
        self.setCheckpoint(5);
      }));

      TurretCluster(28800, 0, Turret);
      TurretCluster(28300, -200, MissileTurret);
      TurretCluster(29300, -200, MissileTurret);
      TurretCluster(29900, 200, Turret);
      TurretCluster(30300, 200, Turret);
      TurretCluster(30600, -260, Turret);
      state.add(Obstacle(30900, 10, 31100, 210));
      state.add(HTrigger(31400, () => {
        s.setTransition(FadeTransition(game, winState));
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
        checkpoints[num].enemies = self.enemyStates.slice();
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
        if(time + checkpoint.time > events[i].time && !events[i].activated && events[i].time > checkpoint.time) {
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
