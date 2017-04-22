import {Colors, Color, ColorUtils, TempColor} from "../gfxutils.js";
import {modulo} from "../math.js";

let colors = {
  bg: Colors.BLACK,
  star: Colors.WHITE
};

export default () => {
  let stars = [];
  let b;
  
  let drawStar = (res, star) => {
    let sx = b.scrollVX / star.z;
    let sy = b.scrollVY / star.z;
    let x = modulo(((star.x * res.r.cwidth) - b.scrollX/star.z), res.r.cwidth) - res.r.cwidth/2;
    let y = modulo(((star.y * res.r.cheight) - b.scrollY/star.z), res.r.cheight) - res.r.cheight/2;
    if((sx > 0 && x > star.oldx) || (sx < 0 && x > star.oldx)) {
      star.y = Math.random();
    }
    star.oldx = x;
    res.lights.setColor(TempColor(1, 1, 1, 0.1));//0.2/star.z));
    res.lights.line(x, y, x+(sx*8.0), y+(sy*8.0), 6, 1);
    res.shapes.setColor(TempColor(1, 1, 1, 0.9*star.z/Math.max(1,sx*10)));
    res.shapes.rect(x-1, y-1, 2 + 16 * sx, 2 + 16 * sy);
  };
  
  let self = {
    initialize(state, behaviour) {
      b = self.b = behaviour;
      for(let i = 0; i < 13; i++) {
        stars.push({x: Math.random(), y: Math.random(), z: Math.random()*0.5+10.0});
      }
    },
    draw(res) {
      // unscroll
      res.matrix.transform.translate(self.b.scrollX, self.b.scrollY);
      res.shapes.setColor(Colors.BLACK);
      
      for(let i = 0; i < stars.length; i++) {
        drawStar(res, stars[i]);
      }
    }
  };
  return self;
};
