export default (x, fcn) => {
  let b;
  return {
    initialize(state, behaviour) {
      b = behaviour;
    },
    tick(delta) {
      if(b.player.x > x) {
        fcn();
        this.toBeRemoved = true;
      }
    }
  };
};
