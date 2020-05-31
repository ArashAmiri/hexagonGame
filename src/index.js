import "./styles.css";
import Game from "./game";
import { GAMESTATE } from "./game";

function getCursorPosition(canvas, event, game, ctx) {
  const rect = canvas.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;

  let foundSelectedHexagon = false;

  game.hexagons.forEach(hexagon => (hexagon.isSelected = false));

  game.hexagons.forEach(hexagon => {
    if (
      x > hexagon.boundingBoxLeftUpper.x &&
      x < hexagon.boundingBoxRightLower.x &&
      y > hexagon.boundingBoxLeftUpper.y &&
      y < hexagon.boundingBoxRightLower.y
    ) {
      if (!foundSelectedHexagon) {
        hexagon.isSelected = true;
        foundSelectedHexagon = true;
      }
    }
  });
}

let canvas = document.getElementById("gameScreen");
let ctx = canvas.getContext("2d");

canvas.oncontextmenu = function(e) {
  e.preventDefault();
  e.stopPropagation();
};

const GAME_WIDTH = 800;
const GAME_HEIGHT = 600;

ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

let game = new Game(GAME_WIDTH, GAME_HEIGHT);

canvas.addEventListener("mousedown", function(e) {
  getCursorPosition(canvas, e, game, ctx);
});

let lastTime = 0;

function gameLoop(timestamp) {
  let deltaTime = timestamp - lastTime;
  lastTime = timestamp;

  ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
  game.update(deltaTime);
  game.draw(ctx);

  requestAnimationFrame(gameLoop);
}

requestAnimationFrame(gameLoop);
