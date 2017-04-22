import BaseState from "./baseState.js";
import SkyBackground from "../objects/skyBackground.js";
import Earth from "../objects/earth.js";

let self = {
  binds: {},
  initialize(state) {
    let binds = {
      left: ["ArrowLeft", "a"],
      right: ["ArrowRight", "d"],
      up: ["ArrowUp", "w"],
      down: ["ArrowDown", "s"],
      fire: ["LeftShift", "RightShift", "z", "x"]
    }
    Object.keys(binds).forEach((key) => {
      self.binds[key] = state.keyboard.createKeybind.apply(null, binds[key]);
    });
    state.add(SkyBackground());
    state.add(Earth());
  }
};

export default (game, transition) => {return BaseState(game, transition, self);};
