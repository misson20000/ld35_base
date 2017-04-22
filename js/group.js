export default () => {
  let objects = [];
  let self = {
    objects,
    add: (object) => {
      objects.push(object);
    },
    remove: (object) => {
      object.toBeRemoved = true;
    },
    tick: (delta, time) => {
      for(let i = 0; i < objects.length; i++) {
        if(objects[i].tick) {
          objects[i].tick(delta, time);
        }
      }

      for(let i = 0; i < objects.length; i++) {
        if(objects[i].toBeRemoved) {
          objects.splice(i, 1);
          i--;
        }
      }
    },
    uniformTick: (time) => {
      for(let i = 0; i < objects.length; i++) {
        if(objects[i].uniformTick) {
          objects[i].uniformTick(time);
        }
      }
    },
    draw: (res) => {
      for(let i = 0; i < objects.length; i++) {
        if(objects[i].draw) {
          objects[i].draw(res);
        }
      }
    },
    drawLights: (res) => {
      for(let i = 0; i < objects.length; i++) {
        if(objects[i].drawLights) {
          objects[i].drawLights(res);
        }
      }
    }
  };
};
