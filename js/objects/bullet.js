import {Colors, Color, ColorUtils, TempColor} from "../gfxutils.js";
import {SmallExplosion} from "./explosions.js";
import {linesegIntersection} from "../math2dvec.js";

export default (player, angle) => {
  let s, b;
  let length = 60;
  let temp1 = {};
  let temp2 = {};
  let temp3 = {};
  let temp4 = {};
  let temp5 = {};
  let cos = Math.cos(angle);
  let sin = Math.sin(angle);
  let self = {
    x: player.x,
    y: player.y,
    xv: 1.3 * cos,
    yv: 1.3 * sin,
    ttl: 700,
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
        if(o.isObstacle) {
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
              self.die();
              return;
            }

            // test bottom
            temp3.y = o.y2;
            if(linesegIntersection(temp1, temp2, temp3, temp4, temp5)) {
              self.die();
              return;
            }

            // test left
            temp3.y = o.y1;
            temp4.x = 0;
            temp4.y = o.y2 - o.y1;
            if(linesegIntersection(temp1, temp2, temp3, temp4, temp5)) {
              self.die();
              return;
            }

            // test right
            temp3.x = o.x2;
            if(linesegIntersection(temp1, temp2, temp3, temp4, temp5)) {
              self.die();
              return;
            }
          }
        }
      }
    },
  };
  return self;
}
