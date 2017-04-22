import {Colors, Color, ColorUtils, TempColor} from "../gfxutils.js";
import {SmallExplosion} from "./explosions.js";

export default (player) => {
  let s, b;
  let length = 60;
  let self = {
    x: player.x+20,
    y: player.y,
    xv: 1.3,
    yv: 0,
    ttl: 700,
    initialize(state, behaviour) {
      s = state;
      b = behaviour;
    },
    draw(res) {
      res.shapes.setColor(Colors.WHITE);
      res.matrix.transform.translate(self.x, self.y);
      res.shapes.rect(length-(self.ttl*length/700), -2, self.ttl*length/700, 4);
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
          if(self.x + length >= o.x1 && self.x <= o.x2 && self.y > o.y1 && self.y < o.y2) {
            self.toBeRemoved = true;
            s.add(SmallExplosion(o.x1, self.y));
            s.shake(5);
          }
        }
      }
    },
  };
  return self;
}
