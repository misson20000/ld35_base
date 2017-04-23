import {Colors, Color, ColorUtils, TempColor} from "../gfxutils.js";
import {linesegIntersection} from "../math2dvec.js";
import {MediumExplosion} from "./explosions.js";
import {AssetManager} from "../assetmgr.js";

let colors = {
  glob: Color(0.8, 0.0, 0.0, 0.8),
  center: Color(0.8, 0.0, 0.0, 0.5)
};

export default (x, y) => {
  let s, b;
  let self = {
    x, y,
    x1: x-25,
    x2: x+25,
    y1: y-25,
    y2: y+25,
    rotate: 0,
    isObstacle: true,
    hp: 3,
    extraRotSpeed: 0,
    initialize(state, behaviour) {
      s = state;
      b = behaviour;
    },
    tick(delta) {
      self.rotate+= delta * (1+self.extraRotSpeed) / 500.0;
    },
    hitByBullet(b, delta) {
      self.hp--;
      self.extraRotSpeed = 10;
      if(self.hp <= 0) {
        self.toBeRemoved = true;
        s.add(MediumExplosion(self.x, self.y));
      }
      return true;
    },
    uniformTick(time) {
      self.extraRotSpeed*= 0.99;
    },
    draw(res) {
      res.matrix.transform.translate(self.x, self.y + (Math.random() -0.5) * self.extraRotSpeed * 2);
      res.matStack.push(res.matrix);
      res.matrix.transform.rotate(self.rotate);
      res.shapes.setColor(colors.glob);
      res.shapes.rect(-15, -15, 30, 2);
      res.shapes.rect(-15, 15, 30, 2);
      res.shapes.rect(-15, -15, 2, 30);
      res.shapes.rect(15, -15, 2, 30);
      res.matStack.pop(res.matrix);

      res.shapes.setColor(colors.center);
      res.shapes.rect(-5, -5, 10, 10);
      
      res.matrix.transform.rotate(-self.rotate);
      res.shapes.setColor(colors.glob);
      res.shapes.rect(-15, -15, 30, 2);
      res.shapes.rect(-15, 15, 30, 2);
      res.shapes.rect(-15, -15, 2, 30);
      res.shapes.rect(15, -15, 2, 30);
    },
    postDraw(res) {
      res.matrix.transform.translate(b.scrollX, b.scrollY);
      res.matrix.transform.scale(10);
      res.font.setColor(TempColor(1, 1, 1, self.extraRotSpeed/10.0));
      res.font.drawCenteredX(self.hp.toString(), 0, -res.font.height()/2, 0, true);
    }
  };
  return self;
};
