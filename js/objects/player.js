import {Colors, Color, ColorUtils, TempColor} from "../gfxutils.js";
import Bullet from "./bullet.js";
import {LargeExplosion} from "./explosions.js";

export default () => {
  let b;
  let s;
  let sensors = [
    [-20, 20],
    [-20, -20],
    [20, 0]
  ];
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
      res.shapes.setColor(Colors.WHITE);
      res.matrix.transform.translate(self.x, self.y);
      res.shapes.triangle(-20, 20, -20, -20, 20, 0);
      for(let i = 1; i < 5; i++) {
        res.matrix.transform.translate(-self.xv*5.0/200, -self.yv*5.0/200);
        res.shapes.setColor(TempColor(1, 1, 1, (5-i)/10));
        res.shapes.triangle(-20, 20, -20, -20, 20, 0);
      }
    },
    tick(delta) {
      self.x+= self.xv;
      self.y+= self.yv;
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
          s.add(Bullet(self));
        }
      }
      for(let i = 0; i < s.objects.length; i++) {
        let o = s.objects[i];
        if(o.isObstacle) {
          for(let j = 0; j < sensors.length; j++) {
            let sen = sensors[j];
            if(self.x + sen[0] >= o.x1 && self.x + sen[0] <= o.x2 && self.y + sen[1] >= o.y1 && self.y + sen[1] <= o.y2) {
              s.add(LargeExplosion(self.x, self.y));
              self.toBeRemoved = true;
              b.died();
            }
          }
        }
      }
    },
  };
  return self;
};
