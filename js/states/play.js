import BaseState from "./baseState.js";
import CheckerboardBackground from "../objects/checkerboardBg.js";

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
      self.binds[key] = state.keyboard.createKeybind.call(null, binds[key]);
    });
    state.add(CheckerboardBackground());
  }
};

export default (game, transition) => {return BaseState(game, transition, self);};
