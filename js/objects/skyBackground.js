import {Colors, Color, ColorUtils, TempColor} from "../gfxutils.js";
import {roundNearest} from "../math.js";

let colors = {
  bg: Color("#0F3852"),
  light: Color("#FFFFFF60")
};

let drawParticle = (res, particle) => {
  //let x = Math.floor(res.r.cwidth*particle.x);
  //let y = Math.floor(res.r.cheight*particle.y);
  let x = res.r.cwidth*particle.x;
  let y = res.r.cheight*particle.y;
  let a = Math.min(particle.appear, 600)/600.0;
  if(particle.disappear !== undefined) {
    a = 1.0-(Math.min(particle.disappear, 300)/300.0);
  }
  a*= 0.4;
  //res.lights.setColor(TempColor(colors.light.r, colors.light.g, colors.light.b, colors.light.a * a));
  //res.lights.point(x, y, 2, 0);
  res.shapes.setColor(TempColor(1, 1, 1, a));
  res.shapes.rect(x-1, y-1, 2, 2);
};

export default () => {
  let particles = [];
  let spawnTimer = 0;
  
  let self = {
    draw(res) {
      res.shapes.setColor(colors.bg);
      res.shapes.rect(-res.r.cwidth/2, -res.r.cheight/2, res.r.cwidth, res.r.cheight);
      for(let i = 0; i < particles.length; i++) {
        drawParticle(res, particles[i]);
      }
    },
    tick(delta) {
      if(particles.length < 10) {
        spawnTimer-= delta;
        while(spawnTimer < 0) {
          spawnTimer+= 300;
          particles.push({x: Math.random()-0.5, y: Math.random()-0.5, nextMoveTimer: 200, moveTimer: 0, appear: 0});
        }
      }

      for(let i = 0; i < particles.length; i++) {
        let p = particles[i];
        p.appear+= delta;
        if(p.nextMoveTimer <= 0) {
          if(p.moveTimer <= 0) {
            if(p.disappear === undefined) {
              if(Math.random() > 0.8) {
                p.disappear = 0.0;
              } else {
                p.nextMoveTimer+= Math.random() * 300 + 200;
              }
            } else {
              p.disappear+= delta;
              if(p.disappear > 300) {
                p.x = Math.random() - 0.5;
                p.y = Math.random() - 0.5;
                p.nextMoveTimer = 200;
                p.moveTimer = 0;
                p.appear = 0;
                p.disappear = undefined;
              }
            }
          } else {
            p.x+= p.moveX * p.moveTimer / 10000000.0;
            p.y+= p.moveY * p.moveTimer / 10000000.0
            p.moveTimer-= delta;
          }
        } else {
          p.nextMoveTimer-= delta;
          if(p.nextMoveTimer <= 0) {
            p.moveTimer = 1400;
            let angle = Math.random() * Math.PI * 2;
            p.moveX = Math.cos(angle);
            p.moveY = Math.sin(angle);
          }
        }
      }
    }
  };
  return self;
};
