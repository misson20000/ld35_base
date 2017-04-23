import {Colors, Color, ColorUtils, TempColor} from "../gfxutils.js";
import Missile from "./missile.js";
import {linesegIntersection} from "../math2dvec.js";
import {MediumExplosion} from "./explosions.js";
import {AssetManager} from "../assetmgr.js";

let colors = {
  base: Color(0.15, 0.15, 0.15, 1.0),
  gun: Color(0.8, 0.2, 0.2, 1.0),
  charge: Color(1.0, 0.2, 0.2, 1.0)
};

export default (x, y, direction) => {
  let b, s;
  let temp1 = {};
  let temp2 = {};
  let temp3 = {};
  let temp4 = {};
  let temp5 = {};
  let self = {
    x, y,
    angle: 0,
    charge: 0,
    isEnemy: true,
    dying: false,
    unseeTimer: 0,
    couldSee: false,
    initialize(state, behaviour) {
      s = state;
      b = behaviour;
      switch(direction) {
      case "up":
        self.x1 = x-40;
        self.x2 = x+40;        
        self.y1 = y-50;
        self.y2 = y;
        self.shootx = x;
        self.shooty = y-40;
        break;
      case "down":
        self.x1 = x-40;
        self.x2 = x+40;        
        self.y1 = y;
        self.y2 = y+50;
        self.shootx = x;
        self.shooty = y+40;
        break;
      case "left":
        self.x1 = x-50;
        self.x2 = x;
        self.y1 = y-40;
        self.y2 = y+40;
        self.shootx = x-40;
        self.shooty = y;
        break;
      case "right":
        self.x1 = x;
        self.x2 = x+50;
        self.y1 = y-40;
        self.y2 = y+40;
        self.shootx = x+40;
        self.shooty = y;
        break;
      }
    },
    hitByBullet(b) {
      if(b.isFriendly && !self.dying) {
        self.dying = true;
        window.setTimeout(() => {
          self.toBeRemoved = true;
        }, 100);
        s.add(MediumExplosion(self.x, self.y));
        s.game.sound.playSound(AssetManager.getAsset("game.sfx.boom"));
        return true;
      }
    },
    tick(delta) {
      let canSee = true;
      
      if(b.player.x + 700.0 > self.x && b.player.x - 700 < self.x) {
        for(let i = 0; i < s.objects.length; i++) {
          let o = s.objects[i];
          if(o.isObstacle) {
            temp1.x = self.shootx;
            temp1.y = self.shooty;
            temp2.x = b.player.x-self.shootx;
            temp2.y = b.player.y-self.shooty;

            // test top
            temp3.x = o.x1;
            temp3.y = o.y1;
            temp4.x = o.x2-o.x1;
            temp4.y = 0;
            if(linesegIntersection(temp1, temp2, temp3, temp4, temp5)) {
              canSee = false;
              break;
            }

            // test bottom
            temp3.y = o.y2;
            if(linesegIntersection(temp1, temp2, temp3, temp4, temp5)) {
              canSee = false;
              break;
            }

            // test left
            temp3.y = o.y1;
            temp4.x = 0;
            temp4.y = o.y2 - o.y1;
            if(linesegIntersection(temp1, temp2, temp3, temp4, temp5)) {
              canSee = false;
              break;
            }

            // test right
            temp3.x = o.x2;
            if(linesegIntersection(temp1, temp2, temp3, temp4, temp5)) {
              canSee = false;
              break;
            }
          }
        }
      } else {
        canSee = false;
      }

      self.canSee = canSee;
      if(canSee) {
        self.targetAngle = Math.atan2(b.player.y-self.shooty, b.player.x-self.shootx);
        self.charge+= delta/1000.0;
        if(self.charge >= 1) {
          self.charge = -1;
          s.add(Missile(self, self.angle, false, self.shootx - self.x, self.shooty - self.y));
        }
      }

      if(self.couldSee && !canSee) {
        self.unseeTimer = 1000;
      }
      self.couldSee = canSee;
      if(!canSee) {
        self.unseeTimer-= delta;
        if(self.unseeTimer <= 0) {
          switch(direction) {
          case "up":
            self.targetAngle = -Math.PI/2;
            break;
          case "down":
            self.targetAngle = Math.PI/2;
            break;
          case "left":
            self.targetAngle = Math.PI;
            break;
          case "right":
            self.targetAngle = 0;
            break;
          }
        }
      }
    },
    uniformTick(time) {
      if(!self.canSee) {
        self.charge*= 0.9;
      }
      if(self.targetAngle !== undefined) {
        self.angle+= (self.targetAngle - self.angle) * 0.05;
      }
    },
    draw(res) {
      res.matrix.transform.translate(self.x, self.y);
      res.shapes.setColor(colors.base);

      switch(direction) {
      case "up":
        res.shapes.rect(-40, -20, 80, 20);
        res.matrix.transform.translate(0, -40);
        break;
      case "down":
        res.shapes.rect(-40, 0, 80, 20);
        res.matrix.transform.translate(0, 40);
        break;
      case "left":
        res.shapes.rect(-20, -40, 20, 80);
        res.matrix.transform.translate(-40, 0);
        break;
      case "right":
        res.shapes.rect(0, -40, 20, 80);
        res.matrix.transform.translate(40, 0);
        break;
      }
      res.matrix.transform.rotate(self.angle);
      res.shapes.setColor(colors.gun);
      res.shapes.rect(0, -8, 40, 16);
      res.shapes.setColor(colors.base);
      res.shapes.rect(5, 5, 30, 4);
      res.shapes.setColor(colors.charge);
      res.shapes.rect(5, 5, Math.min(1, Math.max(0, self.charge))*30.0, 4);
    },
  };
  return self;
};
