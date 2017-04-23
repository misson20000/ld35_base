import {Colors, Color, ColorUtils, TempColor} from "../gfxutils.js";
import {SmallExplosion, MediumExplosion} from "./explosions.js";
import {linesegIntersection} from "../math2dvec.js";

export default (shooter, angle, isFriendly, xoff, yoff) => {
  let s, b;
  let length = 40;
  let temp1 = {};
  let temp2 = {};
  let temp3 = {};
  let temp4 = {};
  let temp5 = {};
  let cos = Math.cos(angle);
  let sin = Math.sin(angle);
  if(xoff === undefined) { xoff = 0; }
  if(yoff === undefined) { yoff = 0; }
  let self = {
    x: shooter.x + xoff,
    y: shooter.y + yoff,
    xv: 0.3 * cos,
    yv: 0.3 * sin,
    length, cos, sin,
    isFriendly,
    isMissile: true,
    angle,
    initialize(state, behaviour) {
      s = state;
      b = behaviour;
      console.log("shot " + self.angle);
    },
    draw(res) {
      res.shapes.setColor(Colors.RED);
      res.matrix.transform.translate(self.x, self.y);
      res.matrix.transform.rotate(self.angle);
      res.shapes.rect(0, -8, length, 16);
    },
    die() {
      self.toBeRemoved = true;
      s.add(MediumExplosion(temp5.x, temp5.y));
      s.shake(2);
    },
    canHit(o) {
      if(!isFriendly && o == b.player) { return true; }
      if(isFriendly && o.isEnemy) { return true; }
      return o.isObstacle;
    },
    hitByBullet(b, delta) {
      /*
      temp1.x = b.x;
      temp1.y = b.y;
      temp2.x = b.xv * delta + b.length * b.cos;
      temp2.y = b.yv * delta + b.length * b.sin;

      temp3.x = self.x;
      temp3.y = self.y;
      temp4.x = self.xv * delta + self.length * self.cos;
      temp4.y = self.yv * delta + self.length * self.sin;

      if(linesegIntersection(temp1, temp2, temp3, temp4, temp5)) {
        self.die();
        return true;
      }
      return false;*/
    },
    hit(o, delta) {
      if(o.hitByBullet) {
        if(o.hitByBullet(self, delta)) {
          self.die();
          return true;
        }
        return false;
      }
      self.die();
      return true;
    },
    tick(delta) {
      self.targetAngle = Math.atan2(b.player.y-self.y, b.player.x-self.x);
      while(Math.abs(self.targetAngle - self.angle) > Math.abs(self.targetAngle - (self.angle + 2*Math.PI))) {
        self.angle+= 2*Math.PI;
      }
      while(Math.abs(self.targetAngle - self.angle) > Math.abs(self.targetAngle - (self.angle - 2*Math.PI))) {
        self.angle-= 2*Math.PI;
      }
      
      if(self.angle < self.targetAngle) {
        self.angle+= delta/600.0;
      }
      if(self.angle > self.targetAngle) {
        self.angle-= delta/600.0;
      }
      self.cos = Math.cos(self.angle);
      self.sin = Math.sin(self.angle);
      cos = self.cos;
      sin = self.sin;
      
      self.xv = 0.3 * self.cos;
      self.yv = 0.3 * self.sin;

      self.x+= self.xv * delta;
      self.y+= self.yv * delta;

      self.x1 = self.x - length;
      self.x2 = self.x + length;
      self.y1 = self.y - length;
      self.y2 = self.y + length;
      
      for(let i = 0; i < s.objects.length; i++) {
        let o = s.objects[i];
        if(self.canHit(o)) {
          if(self.x + length >= o.x1 && self.x - length <= o.x2 && self.y + length >= o.y1 && self.y - length <= o.y2) {
            temp1.x = self.x - (self.xv * delta);
            temp1.y = self.y - (self.yv * delta);
            temp2.x = (self.xv * delta) + (length * cos);
            temp2.y = (self.yv * delta) + (length * sin);

            // test top
            temp3.x = o.x1;
            temp3.y = o.y1;
            temp4.x = o.x2-o.x1;
            temp4.y = 0;
            if(linesegIntersection(temp1, temp2, temp3, temp4, temp5)) {
              if(self.hit(o, delta)) { return; }
            }

            // test bottom
            temp3.y = o.y2;
            if(linesegIntersection(temp1, temp2, temp3, temp4, temp5)) {
              if(self.hit(o, delta)) { return; }
            }

            // test left
            temp3.y = o.y1;
            temp4.x = 0;
            temp4.y = o.y2 - o.y1;
            if(linesegIntersection(temp1, temp2, temp3, temp4, temp5)) {
              if(self.hit(o, delta)) { return; }
            }

            // test right
            temp3.x = o.x2;
            if(linesegIntersection(temp1, temp2, temp3, temp4, temp5)) {
              if(self.hit(o, delta)) { return; }
            }
          }
        }
      }
    },
  };
  return self;
}
