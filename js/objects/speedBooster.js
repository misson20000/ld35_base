export default (x) => {
  let b;
  return {
    initialize(state, behaviour) {
      b = behaviour;
    },
    tick(delta) {
      if(b.player.x > x && b.player.x < x + 200) {
        b.scrollVX*= 4;
        this.toBeRemoved = true;
      }
    }
  };
};
