import "./styles/main.scss";
import init, { greet } from "gol-backend";

async function main() {
  const app = document.querySelector<HTMLDivElement>("#app")!;

  app.innerHTML = `
  <h1>Hello Vite!</h1>
  <a href="https://vitejs.dev/guide/features.html" target="_blank">Documentation</a>
`;

  await init();

  greet();
}

main();
