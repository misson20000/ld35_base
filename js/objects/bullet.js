import {Colors, Color, ColorUtils, TempColor} from "../gfxutils.js";
import {SmallExplosion} from "./explosions.js";
import {linesegIntersection} from "../math2dvec.js";

export default (shooter, angle, isFriendly, xoff, yoff) => {
  let s, b;
  let length = 60;
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
    xv: (isFriendly ? 1.7 : 1.0) * cos,
    yv: (isFriendly ? 1.7 : 1.0) * sin,
    length, cos, sin,
    ttl: 700,
    isFriendly,
    isBullet: true,
    initialize(state, behaviour) {
      s = state;
      b = behaviour;
    },
    draw(res) {
      res.shapes.setColor(Colors.WHITE);
      res.matrix.transform.translate(self.x, self.y);
      res.matrix.transform.rotate(angle);
      res.shapes.rect(length-(self.ttl*length/700), -2, self.ttl*length/700, 4);
    },
    die() {
      self.toBeRemoved = true;
      s.add(SmallExplosion(temp5.x, temp5.y));
      s.shake(2);
    },
    canHit(o) {
      if(!isFriendly && o == b.player) { return true; }
      if(isFriendly && o.isEnemy) { return true; }
      if(isFriendly != o.isFriendly && o.isBullet) { return true; }
      return o.isObstacle;
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
      self.x+= self.xv * delta;
      self.y+= self.yv * delta;
      self.ttl-= delta;
      if(self.ttl <= -10) {
        self.toBeRemoved = true;
        s.add(SmallExplosion(self.x, self.y));
      }
      for(let i = 0; i < s.objects.length; i++) {
        let o = s.objects[i];
        if(self.canHit(o)) {
          if(self.x + length >= o.x1 && self.x - length <= o.x2 && self.y + length >= o.y1 && self.y - length <= o.y2) {
            temp1.x = self.x - (self.xv * delta);
            temp1.y = self.y - (self.yv * delta);
            temp2.x = self.xv * delta + length * cos;
            temp2.y = self.yv * delta + length * sin;

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
