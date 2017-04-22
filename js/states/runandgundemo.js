import BaseState from "./baseState.js";
import CheckerboardBackground from "../objects/checkerboardBg.js";
import {Colors, Color, ColorUtils, TempColor} from "../gfxutils.js";
import PhysicsSimulator from "../physicsAA2D.js";

let Player = () => {
  let self = {
    x: 0,
    y: -200,
    w: 30,
    h: 30,
    initialize(state, behaviour) {
      
    },
    draw(res) {
      res.matrix.transform.translate(self.x, self.y);
      res.shapes.setColor(Colors.BLUE);
      res.shapes.rect(0, 0, 30, 30);
      res.shapes.setColor(self.hit.left ? Colors.RED : Colors.GREEN);
      res.shapes.rect(0, 0, 3, 30);
      res.shapes.setColor(self.hit.right ? Colors.RED : Colors.GREEN);
      res.shapes.rect(27, 0, 3, 30);
      res.shapes.setColor(self.hit.top ? Colors.RED : Colors.GREEN);
      res.shapes.rect(0, 0, 30, 3);
      res.shapes.setColor(self.hit.bottom ? Colors.RED : Colors.GREEN);
      res.shapes.rect(0, 27, 30, 3);
      
      for(let i = 0; i < self.sensors.length; i++) {
        let s = self.sensors[i];
        res.shapes.setColor(Colors.WHITE);
        res.shapes.rect(s[0]-1, s[1]-1, 2, 2);
      }
      if(self.vsx !== undefined) {
        res.shapes.triangle(14, 14, 16, 16, 15 + self.vsx*20, 15 + self.vsy*20);
      }
    }
  };
  return self;
};

let StaticRect = (x, y, w, h) => {
  return {
    x: x,
    y: y,
    w: w,
    h: h,
    isStatic: true,
    draw(res) {
      res.shapes.setColor(Colors.WHITE);
      res.shapes.rect(this.x, this.y, this.w, this.h);
      res.shapes.setColor(Colors.BLACK);
      res.shapes.rect(this.x+1, this.y+1, this.w-2, this.h-2);
    }
  };
};

let StaticSlope = (x, y, w, h) => {
  return {
    x: x,
    y: y,
    w: w,
    h: h,
    isStatic: true,
    draw(res) {
      res.shapes.setColor(Colors.WHITE);
      res.shapes.rect(this.x, this.y, this.w, this.h);
      res.shapes.setColor(Colors.BLACK);
      res.shapes.rect(this.x+1, this.y+1, this.w-2, this.h-2);
    }
  };
};

let self = {
  binds: {},
  initialize(state) {
    let physics = PhysicsSimulator(state);
    let binds = {
      left: ["ArrowLeft", "a"],
      right: ["ArrowRight", "d"],
      up: ["ArrowUp", "w"],
      down: ["ArrowDown", "s"],
      fire: ["LeftShift", "RightShift", "x"],
      jump: [" ", "z"]
    }
    Object.keys(binds).forEach((key) => {
      self.binds[key] = state.keyboard.createKeybind.apply(state.keyboard, binds[key]);
    });

    let add_s = state.add;
    let addp_ = physics.add;
    let addps = (object) => {
      state.add(object);
      physics.add(object);
    };
    
    add_s(CheckerboardBackground());
    addps(self.player = Player());
    addps(StaticRect(-30, 50, 80, 30));
    addps(StaticRect(90, 50, 120, 30));
    addps(StaticRect(-60, 20, 30, 60));
    addps(StaticRect(-300, 80, 600, 60));
    addps(StaticRect(-130, -10, 30, 30));
    //addps(StaticSlope(110, 50, 200, 50, 200, -40));
    
    state.add(physics);
  },
  tick(delta, time) {
    if(self.binds.up.justPressed()) {
      console.log("jump");
      self.player.yv-= 3;
    }
  },
  uniformTick(time) {
    if(self.binds.left.isPressed()) {
      if(self.player.xv > -1) {
        self.player.xv-= 0.03;
      }
    }
    if(self.binds.right.isPressed()) {
      if(self.player.xv < 1) {
        self.player.xv+= 0.03;
      }
    }
  }
};

export default (game, transition) => {return BaseState(game, transition, self);};
