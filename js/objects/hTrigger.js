export default (x, fcn) => {
  let b;
  return {
    initialize(state, behaviour) {
      b = behaviour;
    },
    tick(delta) {
      if(b.player.x > x && b.player.x < x + 200) {
        fcn();
        this.toBeRemoved = true;
      }
    }
  };
};
