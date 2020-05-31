export default class InputHandler {
  constructor(game) {
    document.addEventListener("keydown", event => {
      switch (event.keyCode) {
        case 83:
          game.spawnRiver();
          break;
      }
    });
  }
}
