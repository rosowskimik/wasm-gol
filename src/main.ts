import "./styles/main.css";

import init, { Cell, Universe } from "gol-backend";

const CELL_SIZE = 10;
const GRID_COLOR = "#cccccc";
// const GRID_COLOR = "#000000";
const DEAD_COLOR = "#ffffff";
const ALIVE_COLOR = "#000000";

async function main() {
  // Initialize WASM module (also grab wasm.memory)
  const { memory } = await init();

  // Grab DOM elements
  const togglePlayBtn = document.querySelector<HTMLButtonElement>("#toggle")!;
  const stepBtn = document.querySelector<HTMLButtonElement>("#step")!;
  const resetBtn = document.querySelector<HTMLButtonElement>("#reset")!;
  const randomBtn = document.querySelector<HTMLButtonElement>("#random")!;
  const resizeBtn = document.querySelector<HTMLButtonElement>("#resize")!;
  const widthInput = document.querySelector<HTMLInputElement>("#width")!;
  const heightInput = document.querySelector<HTMLInputElement>("#height")!;
  const canvas = document.querySelector<HTMLCanvasElement>("#gol-canvas")!;
  const ctx = canvas.getContext("2d")!;

  let width = widthInput.valueAsNumber;
  let height = heightInput.valueAsNumber;
  canvas.width = (CELL_SIZE + 1) * width + 1;
  canvas.height = (CELL_SIZE + 1) * height + 1;

  // Create universe
  const universe = new Universe(width, height);

  const drawGrid = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.beginPath();
    ctx.strokeStyle = GRID_COLOR;

    for (let i = 0; i <= width; i++) {
      ctx.moveTo(i * (CELL_SIZE + 1) + 0.5, 0);
      ctx.lineTo(i * (CELL_SIZE + 1) + 0.5, (CELL_SIZE + 1) * height + 1);
    }

    for (let j = 0; j <= height; j++) {
      ctx.moveTo(0, j * (CELL_SIZE + 1) + 0.5);
      ctx.lineTo((CELL_SIZE + 1) * width + 1, j * (CELL_SIZE + 1) + 0.5);
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

  let animationId: number | null = null;
  // Draw next frame
  const step = () => {
    drawCells();
    universe.tick();
  };

  const renderLoop = () => {
    step();
    animationId = requestAnimationFrame(renderLoop);
  };

  const play = () => {
    togglePlayBtn.textContent = "Pause";
    animationId = requestAnimationFrame(renderLoop);
  };

  const pause = () => {
    if (animationId) {
      cancelAnimationFrame(animationId);
      animationId = null;
    }
    togglePlayBtn.textContent = "Play";
  };

  // Setup event handlers
  togglePlayBtn.addEventListener("click", (e) => {
    e.preventDefault();

    if (animationId) {
      pause();
    } else {
      play();
    }
  });

  stepBtn.addEventListener("click", (e) => {
    e.preventDefault();

    pause();

    requestAnimationFrame(step);
  });

  resetBtn.addEventListener("click", (e) => {
    e.preventDefault();

    pause();
    universe.reset();

    if (animationId === null) {
      requestAnimationFrame(step);
    }
  });

  randomBtn.addEventListener("click", (e) => {
    e.preventDefault();

    universe.fillRandom();
    if (animationId === null) {
      requestAnimationFrame(step);
    }
  });

  resizeBtn.addEventListener("click", (e) => {
    e.preventDefault();

    pause();

    width = widthInput.valueAsNumber;
    height = heightInput.valueAsNumber;

    canvas.width = (CELL_SIZE + 1) * width + 1;
    canvas.height = (CELL_SIZE + 1) * height + 1;
    universe.resize(width, height);

    drawGrid();
  });

  // Initial draw of the grid
  drawGrid();
}

main();
