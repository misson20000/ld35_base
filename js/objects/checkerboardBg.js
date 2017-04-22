import {Colors, Color, ColorUtils} from "../gfxutils.js";
import {roundNearest} from "../math.js";

let colors = {
  checkerA: Color(0.025, 0.025, 0.025, 1),
  checkerB: Color(0.03, 0.03, 0.03, 1)
};

export default () => {
  let self = {
    draw(res) {
      let sz = roundNearest(Math.max(res.r.cwidth, res.r.cheight)*Math.sqrt(2), 20);
      
      for(let x = 0; x < sz; x+= 20) {
        for(let y = 0; y < sz; y+= 20) {
          res.shapes.setColor((x + y) % 40 == 0 ? colors.checkerA : colors.checkerB);
          res.shapes.rect(x-sz/2, y-sz/2, 20, 20);
        }
      }
    }
  };
  return self;
};
