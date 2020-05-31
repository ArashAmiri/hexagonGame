import Hexagon from "./hexagon";
import { FIELDTYPE, HEXAGON_SIZE } from "./hexagon";
import InputHandler from "./input";
import Civilization from "./civilization";

const ROW_SIZE = 10;
const MAX_WATER_FIELD_COUNT = 10;
const CIVILIZATION_LIMIT = 20;

export default class Game {
  constructor(gameWidth, gameHeight) {
    this.menuCanvas = document.getElementById("menuScreen");

    this.gameWidth = gameWidth;
    this.gameHeight = gameHeight;

    this.hexagons = [];
    this.initHexagons();
    this.determineNeighbours();

    new InputHandler(this);
  }

  initHexagons() {
    let colCount = 0;
    let rowCount = 0;
    let colCountOffset = 0;

    let waterLine = {
      x: Math.floor(Math.random() * this.gameWidth),
      y: Math.floor(Math.random() * this.gameHeight)
    };

    let waterFieldCount = 0;
    let mountainFieldCount = 0;
    let hillFieldCount = 0;
    for (let i = 1; i < 100; i++) {
      let keys = Object.keys(FIELDTYPE);
      keys = keys.filter(entry => entry != "WATER" && entry != "RIVER");

      keys.push("GREEN"); // add one more green to bias the random towards green
      keys.push("GREEN"); // add one more green to bias the random towards green

      const randIndex = Math.floor(Math.random() * keys.length);
      const randKey = keys[randIndex];
      const type = FIELDTYPE[randKey];

      let hexagonX = HEXAGON_SIZE.WIDTH * colCount + colCountOffset;
      let hexagonY = (HEXAGON_SIZE.HEIGHT - HEXAGON_SIZE.HEIGHT / 4) * rowCount;

      if (
        waterFieldCount < MAX_WATER_FIELD_COUNT &&
        hexagonX < waterLine.x &&
        hexagonY < waterLine.y
      ) {
        type = FIELDTYPE.WATER;
        waterFieldCount++;
      }

      let hex = new Hexagon(hexagonX, hexagonY, type, rowCount, colCount);
      this.hexagons.push(hex);
      colCount++;
      if (i != 0 && i % ROW_SIZE === 0) {
        colCount = 0;
        colCountOffset === 0
          ? (colCountOffset = HEXAGON_SIZE.WIDTH / 2)
          : (colCountOffset = 0);
        rowCount++;
      }
    }
  }

  determineNeighbours() {
    for (let i = 0; i < this.hexagons.length; i++) {
      let hex = this.hexagons[i];

      let nextRowNeighbourIndexOffset = hex.rowIndex % 2 === 0 ? -1 : 1;

      let neighbours = this.hexagons.filter(
        p =>
          (p.rowIndex === hex.rowIndex && p.colIndex === hex.colIndex - 1) ||
          (p.rowIndex === hex.rowIndex && p.colIndex === hex.colIndex + 1) ||
          (p.rowIndex === hex.rowIndex - 1 && p.colIndex === hex.colIndex) ||
          (p.rowIndex === hex.rowIndex - 1 &&
            p.colIndex === hex.colIndex + nextRowNeighbourIndexOffset) ||
          (p.rowIndex === hex.rowIndex + 1 && p.colIndex === hex.colIndex) ||
          (p.rowIndex === hex.rowIndex + 1 &&
            p.colIndex === hex.colIndex + nextRowNeighbourIndexOffset)
      );
      hex.neighbours = neighbours;
    }
  }

  update(deltaTime) {
    this.hexagons.forEach(hex => {
      hex.update(deltaTime);

      let populationSum = hex.population;
      hex.neighbours.forEach(
        neighbour => (populationSum += neighbour.population)
      );

      if (hex.civilization && hex.civilization.centerHexagon === hex) {
        hex.civilization.population = populationSum;
      } else if (!hex.civilization) {
        if (populationSum > CIVILIZATION_LIMIT) {
          let civilization = new Civilization(hex, populationSum);
          hex.civilization = civilization;
          hex.neighbours.forEach(
            neighbour => (neighbour.civilization = civilization)
          );
        }
      }
    });
  }

  draw(ctx) {
    ctx.clearRect(this.submenuX, this.submenuY, 100, 100);
    this.hexagons.forEach(obj => obj.draw(ctx));
  }

  spawnRiver() {
    let selectedHexagons = this.hexagons.filter(hex => hex.isSelected === true);
    let selectedHexagon = selectedHexagons[0];
    if (!selectedHexagon) return;
    if (selectedHexagon.type === FIELDTYPE.MOUNTAIN) {
      let path = [];
      let finishedPaths = [];
      this.generateRiverToTheSea(selectedHexagon, path, finishedPaths);
      if (finishedPaths.length > 0) {
        finishedPaths[0].forEach(hex => {
          hex.type = FIELDTYPE.RIVER;
          hex.initImage();
        });
      }
      console.log("Finished path: ", finishedPaths);
    }
  }

  generateRiverToTheSea(hex, path, finishedPath) {
    if (hex.type === FIELDTYPE.WATER) {
      finishedPath.push(path);
      return;
    }

    hex.neighbours
      .filter(
        neighbour =>
          neighbour.type === FIELDTYPE.GREEN ||
          neighbour.type === FIELDTYPE.WATER
      )
      .forEach(greenOrWaterNeighbour => {
        if (finishedPath.length === 0) {
          if (!path.includes(greenOrWaterNeighbour)) {
            path.push(greenOrWaterNeighbour);
            this.generateRiverToTheSea(
              greenOrWaterNeighbour,
              path,
              finishedPath
            );
          }
        }
      });
  }
}
