import {Colors, Color, ColorUtils, TempColor} from "../gfxutils.js";
import Bullet from "./bullet.js";
import {LargeExplosion} from "./explosions.js";
import {AssetManager} from "../assetmgr.js";
import {linesegIntersection} from "../math2dvec.js";

export default () => {
  let b;
  let s;
  let sensors = [
    [-20, 20],
    [-20, -20],
    [20, 0]
  ];
  let temp1 = {};
  let temp2 = {};
  let temp3 = {};
  let temp4 = {};
  let temp5 = {};
  let self = {
    x: 0,
    y: 0,
    xv: 0,
    yv: 0,
    initialize(state, behaviour) {
      b = behaviour;
      s = state;
    },
    draw(res) {
      res.lights.setColor(TempColor(1, 1, 1, 0.1));
      res.lights.point(self.x-10, self.y, 50, 0);
      res.shapes.setColor(Colors.WHITE);
      res.matrix.transform.translate(self.x, self.y);
      res.shapes.triangle(-20, 20, -20, -20, 20, 0);
      for(let i = 1; i < 5; i++) {
        res.matrix.transform.translate(-(self.xv+b.scrollVX*10)*5.0/200, -self.yv*5.0/200);
        res.shapes.setColor(TempColor(1, 1, 1, (5-i)/10));
        res.shapes.triangle(-20, 20, -20, -20, 20, 0);
      }
    },
    tick(delta) {
      self.x+= b.scrollVX * delta;
      self.x+= self.xv;
      self.y+= self.yv;
      self.x1 = self.x - 20;
      self.y1 = self.y - 20;
      self.x2 = self.x + 20;
      self.y2 = self.y + 20;
      let friction = 0.035;
      if(self.xv > 0) {
        self.xv-= friction * delta;
        if(self.xv < 0) {
          self.xv = 0;
        }
      }
      if(self.xv < 0) {
        self.xv+= friction * delta;
        if(self.xv > 0) {
          self.xv = 0;
        }
      }
      if(self.yv > 0) {
        self.yv-= friction * delta;
        if(self.yv < 0) {
          self.yv = 0;
        }
      }
      if(self.yv < 0) {
        self.yv+= friction * delta;
        if(self.yv > 0) {
          self.yv = 0;
        }
      }
      if(b.inputEnabled) {
        let maxSpeed = 8;
        if(b.binds.left.isPressed() && self.xv > -maxSpeed) {
          self.xv-= delta*0.05;
        }
        if(b.binds.right.isPressed() && self.xv < maxSpeed) {
          self.xv+= delta*0.05;
        }
        if(b.binds.up.isPressed() && self.yv > -maxSpeed) {
          self.yv-= delta*0.05;
        }
        if(b.binds.down.isPressed() && self.yv < maxSpeed) {
          self.yv+= delta*0.05;
        }
        if(b.binds.fire.justPressed()) {
          s.add(Bullet(self, 0, true));
          s.add(Bullet(self, Math.PI / 6, true));
          s.add(Bullet(self, -Math.PI / 6, true));
          s.game.sound.playSound(AssetManager.getAsset("game.sfx.shoot"));
        }
      }
      for(let i = 0; i < s.objects.length; i++) {
        let o = s.objects[i];
        if(o.isObstacle) {
          for(let j = 0; j < sensors.length; j++) {
            let sen = sensors[j];
            if(self.x + sen[0] >= o.x1 && self.x + sen[0] <= o.x2 && self.y + sen[1] >= o.y1 && self.y + sen[1] <= o.y2) {
              self.die();
            }
          }
        }
      }
    },
    die() {
      s.add(LargeExplosion(self.x, self.y));
      self.toBeRemoved = true;
      b.died();
    },
    hitByBullet(bullet, delta) {
      temp1.x = bullet.x - (bullet.xv * delta);
      temp1.y = bullet.y - (bullet.yv * delta);
      temp2.x = bullet.xv * delta + bullet.length * bullet.cos;
      temp2.y = bullet.yv * delta + bullet.length * bullet.sin;

      // test left
      temp3.x = self.x - 20;
      temp3.y = self.y - 20;
      temp4.x = 0;
      temp4.y = 40;
      if(linesegIntersection(temp1, temp2, temp3, temp4, temp5)) {
        self.die();
        return true;
      }

      // test top
      temp4.x = 40;
      temp4.y = 20;
      if(linesegIntersection(temp1, temp2, temp3, temp4, temp5)) {
        self.die();
        return true;
      }

      // test bottom
      temp3.y = self.y + 20;
      temp4.y = -20;
      if(linesegIntersection(temp1, temp2, temp3, temp4, temp5)) {
        self.die();
        return true;
      }

      return false;
    }
  };
  return self;
};
