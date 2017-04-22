import {Colors, Color, ColorUtils, TempColor} from "../gfxutils.js";

export let SmallExplosion = (x, y) => {
  let self = {
    x, y,
    lifetime: 0,
    draw(res) {
      res.matrix.transform.translate(self.x, self.y);

      let color = TempColor(1, 0.5, 0.5, 1);
      color.a = 1.0-self.lifetime/75;
      res.shapes.setColor(color);
      let r = Math.min(20, self.lifetime*20/50);
      res.shapes.circle(0, 0, r);
    },
    tick(delta) {
      self.lifetime+= delta;
      if(self.lifetime >= 75) {
        self.toBeRemoved = true;
      }
    }
  };
  return self;
};

let orange = Color("FFB300");
let yellow = Color("FFFF00");
let particle = Color(0.2, 0.2, 0.2, 1);

let Particle = (x, y) => {
  let s;
  let self = {
    x, y,
    angle: 0,
    angv: 0.1,
    size: Math.random() * 5,
    initialize(state, behaviour) {
      s = state;
      let angle = Math.random() * Math.PI * 2;
      self.xv = Math.cos(angle);
      self.yv = Math.sin(angle) * 2 - 1.5;
    },
    draw(res) {
      res.shapes.setColor(particle);
      res.matrix.transform.translate(self.x, self.y);
      res.matrix.transform.rotate(self.angle);
      res.shapes.rect(-self.size/2, -self.size/2, self.size, self.size);
    },
    tick(delta) {
      self.x+= self.xv * delta / 10.0;
      self.y+= self.yv * delta / 10.0;
      self.yv+= delta / 300.0;
      self.angle+= self.angv * delta / 10.0;
    },
    uniformTick(time) {
      self.angv*= 0.99;
    }
  };
  return self;
};

export let MediumExplosion = (x, y) => {
  let self = {
    x, y,
    lifetime: 0,
    draw(res) {
      res.matrix.transform.translate(self.x, self.y);
      
    let color = TempColor(yellow.r, yellow.g, yellow.b, 1);
      color.a = 2.0-(self.lifetime/200);
      res.shapes.setColor(color);
      let r = Math.min(30, self.lifetime*30.0/300.0);
      res.shapes.circle(0, 0, r);
    },
    tick(delta) {
      self.lifetime+= delta;
      if(self.lifetime >= 1000) {
        self.toBeRemoved = true;
      }
    }
  };
  return self;
};

export let LargeExplosion = (x, y) => {
  let subExplosions = [];
  let s, b;
  let self = {
    x, y,
    lifetime: 0,
    initialize(state, behaviour) {
      s = state; b = behaviour;
      s.shake(50);
      for(let i = 0; i < 10; i++) {
        state.add(Particle(x, y));
      }
      for(let i = 0; i < 4; i++) {
        subExplosions.push({delay: Math.random() * 100, obj: MediumExplosion(x + Math.random() * 40 - 20, y + Math.random() * 40 - 20)});
      }
    },
    draw(res) {
      res.matrix.transform.translate(self.x, self.y);

      let color = TempColor(orange.r, orange.g, orange.b, 1);
      color.a = 2.0-(self.lifetime/100);
      res.shapes.setColor(color);
      let r = Math.min(100, self.lifetime*50/50);
      res.shapes.circle(0, 0, r);
      res.lights.setColor(TempColor(1, 1, 1, 0.1));
      res.lights.point(0, 0, 60, r);
    },
    drawLights(res) {
      let r = Math.min(100, self.lifetime*50/50);
      res.lights.setColor(Colors.WHITE);
      res.lights.point(self.x, self.y, 60, r);
    },
    tick(delta) {
      self.lifetime+= delta;
      let noRemove = false;
      for(let i = 0; i < subExplosions.length; i++) {
        if(!subExplosions[i].spawned) {
          if(self.lifetime > subExplosions[i].delay) {
            s.add(subExplosions[i].obj);
          } else {
            noRemove = true;
          }
        }
      }
      if(self.lifetime >= 90 && !noRemove) {
        self.toBeRemoved = true;
      }
    }
  };
  return self;
};
