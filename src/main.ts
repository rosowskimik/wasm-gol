import "./styles/main.scss";
import init, { Universe, Cell } from "gol-backend";

const CELL_SIZE = 10;
const GRID_COLOR = "#cccccc";
const DEAD_COLOR = "#ffffff";
const ALIVE_COLOR = "#000000";

async function main() {
  const { memory } = await init();

  const universe = new Universe(146, 75);
  const width = universe.width;
  const height = universe.height;

  const canvas = document.querySelector<HTMLCanvasElement>("#gol-canvas")!;
  canvas.width = (CELL_SIZE + 1) * width + 1;
  canvas.height = (CELL_SIZE + 1) * height + 1;

  const ctx = canvas.getContext("2d")!;

  const drawGrid = () => {
    ctx.beginPath();
    ctx.strokeStyle = GRID_COLOR;

    for (let i = 0; i <= width; i++) {
      ctx.moveTo(i * (CELL_SIZE + 1) + 1, 0);
      ctx.lineTo(i * (CELL_SIZE + 1) + 1, (CELL_SIZE + 1) * height + 1);
    }

    for (let j = 0; j <= height; j++) {
      ctx.moveTo(0, j * (CELL_SIZE + 1) + 1);
      ctx.lineTo((CELL_SIZE + 1) * width + 1, j * (CELL_SIZE + 1) + 1);
    }

    ctx.stroke();
  };

  const drawCells = () => {
    const cellsPtr = universe.cells();
    const cells = new Uint8Array(memory.buffer, cellsPtr, width * height);

    ctx.beginPath();
    for (let row = 0; row < height; row++) {
      for (let col = 0; col < width; col++) {
        const idx = universe.getIndex(col, row);

        ctx.fillStyle = cells[idx] === Cell.Dead ? DEAD_COLOR : ALIVE_COLOR;

        ctx.fillRect(
          col * (CELL_SIZE + 1) + 1,
          row * (CELL_SIZE + 1) + 1,
          CELL_SIZE,
          CELL_SIZE
        );
      }
    }
  };

  const render = () => {
    universe.tick();
    drawCells();
    requestAnimationFrame(render);
  };

  drawGrid();
  render();
}

main();