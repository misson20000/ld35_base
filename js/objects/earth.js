import {Colors, Color, ColorUtils, TempColor} from "../gfxutils.js";

let colors = {
  ocean: Color("#2F95ED"),
  grass: Color("#178525"),
  dirt: Color("#1F1905"),
  light: Color("#ADD8F720"),
};


export default () => {
  let angle = 0;
  let angV = 0;
  let targetAngle = 0;
  let self = {
    draw(res) {
      let r = 1000;
      res.matrix.transform.translate(0, res.r.cheight/2+700);
      res.matrix.transform.rotate(angle);
      res.lights.setColor(colors.light);
      res.lights.point(0, 0, 80, r+10);
      res.shapes.setColor(colors.grass);
      //res.shapes.rect(-200, -200, 400, 400);
      res.shapes.circle(0, 0, r);
      res.shapes.setColor(colors.dirt);
      //res.shapes.rect(-185, -185, 370, 370);
      res.shapes.circle(0, 0, r-15);
    },
    turnRight() {
      targetAngle+= Math.PI / 2;
      console.log("right");
    },
    turnLeft() {
      targetAngle-= Math.PI / 2;
      console.log("left");
    },
    tick(delta) {
    },
    uniformTick(time) {
      angle+= (targetAngle - angle) * 0.05;
    },
    initialize(state, behaviour) {
      behaviour.binds.right.addPressCallback(() => {
        self.turnRight();
      });
      behaviour.binds.left.addPressCallback(() => {
        self.turnLeft();
      });
    }
  };
  return self;
};
