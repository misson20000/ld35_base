// simple axis aligned 2d physics

import {linesegIntersection} from "./math2dvec.js";

export default (state, config) => {
  let collisionGroups = {};
  let objects = [];

  let collisionResolution = {};
  let collisionTestPoint = {};
  let temp1 = {};
  let temp2 = {};
  let temp3 = {};
  let checkSensorWithGroup = (o, sensor, approach, group) => {
    let collided = false;
    for(let i = 0; i < group.length; i++) {
      let t = group[i];
      if(t == o) { continue; }
      collisionTestPoint.x = o.x + sensor[0];
      collisionTestPoint.y = o.y + sensor[1];
      if(t.checkSensor) {
        collided = collided || t.checkSensor(o, collisionTestPoint, approach, collisionResolution, group[i]);
      } else {
        temp1.x = t.x;
        temp1.y = t.y;
        if(approach.y > 0 && sensor[3] > 0) {
          temp2.x = t.w;
          temp2.y = 0;
          // test top of rect
          if(linesegIntersection(collisionTestPoint, approach, temp1, temp2, temp3)) {
            o.hit.bottom = true;
            collided = true;
            collisionResolution.y = temp3.y - sensor[1];
          }
        }
        if(approach.x > 0 && sensor[2] > 0) {
          temp2.x = 0;
          temp2.y = t.h;
          // test left of rect
          if(linesegIntersection(collisionTestPoint, approach, temp1, temp2, temp3)) {
            o.hit.right = true;
            collided = true;
            collisionResolution.x = temp3.x - sensor[0];
          }
        }
        if(approach.y < 0 && sensor[3] < 0) {
          temp1.x = t.x;
          temp1.y = t.y + t.h;
          temp2.x = t.w;
          temp2.y = 0;
          // test bottom of rect
          if(linesegIntersection(collisionTestPoint, approach, temp1, temp2, temp3)) {
            o.hit.top = true;
            collided = true;
            collisionResolution.y = temp3.y - sensor[1];
          }
        }
        if(approach.x < 0 && sensor[2] < 0) {
          temp1.x = t.x + t.w;
          temp1.y = t.y;
          temp2.x = 0;
          temp2.y = t.h;
          // test right of rect
          if(linesegIntersection(collisionTestPoint, approach, temp1, temp2, temp3)) {
            o.hit.left = true;
            collided = true;
            collisionResolution.x = temp3.x - sensor[0];
          }
        }
      }
    }
    return collided;
  };
  let checkSensor = (o, sensor, approach) => {
    if(o.collidesWith) {
      let hit = false;
      for(let i = 0; i < o.collidesWith; i++) {
        if(checkSensorWithGroup(o, sensor, approach, collisionGroups[o.collidesWith[i]])) {
          hit = true;
        }
      }
      return hit;
    } else {
      return checkSensorWithGroup(o, sensor, approach, objects);
    }
  };

  let approach = {};
  
  let applyVelocity = (o) => {
    let xv = o.xv;
    let yv = o.yv;
    if(xv == 0 && yv == 0) {
      return;
    }
    let steps = 2;
    let collided = false;
    let sensors = o.sensors;
    for(let i = 0; i < steps; i++) {
      approach.x = xv/steps;
      approach.y = yv/steps;
      let collided = false;
      o.hit.left = false;
      o.hit.right = false;
      o.hit.top = false;
      o.hit.bottom = false;
      collisionResolution.x = o.x + approach.x;
      collisionResolution.y = o.y + approach.y;
      for(let j = 0; j < sensors.length; j++) {
        if(checkSensor(o, sensors[j], approach)) {
          approach.x = collisionResolution.x - o.x;
          approach.y = collisionResolution.y - o.y;
          collided = true;
        }
      }

      o.x = collisionResolution.x;
      o.y = collisionResolution.y;
      if(o.hit.bottom || o.hit.top) {
        o.yv = 0;
      }
      if(o.hit.left || o.hit.right) {
        o.xv = 0;
      }
      if(collided) {
        break;
      }
    }
  };
  
  let self = {
    add(object) {
      objects.push(object);
      if(object.collisionGroups) {
        for(let i = 0; i < object.collisionGroups.length; i++) {
          let cg = object.collisionGroups[i];
          if(!collisionGroups[cg]) { collisionGroups[cg] = []; }
          collisionGroups[cg].push(object);
        }
      }
      let o = object;
      if(!o.sensors) {
        o.sensors = [[0, 0, -1, -1], [o.w, 0, 1, -1], [0, o.h, -1, 1], [o.w, o.h, 1, 1]];
      }
      if(!o.hit) {
        o.hit = {
          left: false,
          right: false,
          top: false,
          bottom: false
        };
      }
      if(o.xv === undefined) { o.xv = 0; }
      if(o.yv === undefined) { o.yv = 0; }
    },
    uniformTick(time) {
      let delta = 5;
      for(let i = 0; i < objects.length; i++) {
        let o = objects[i];
        if(!o.isStatic) {
          o.vsx = o.xv;
          o.vsy = o.yv;
          applyVelocity(o);
          o.xv*= 0.99;
          o.yv+= 0.04;
        }
      }
    }
  };
  return self;
};
