export default (x) => {
  let b;
  return {
    initialize(state, behaviour) {
      b = behaviour;
    },
    tick(delta) {
      if(b.player.x > x) {
        b.scrollVX*= 4;
        this.toBeRemoved = true;
      }
    }
  };
};
