import {Colors, Color, ColorUtils, TempColor} from "../gfxutils.js";

export default (x, y, direction) => {
  let self = {
    x, y,
    draw(res) {
      res.matrix.transform.translate(self.x, self.y);
      res.shapes.setColor(Colors.RED);
      res.shapes.circle(0, 0, 10);
    },
  };
  return self;
};
