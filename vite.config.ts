import { defineConfig } from "vite";
import ViteRsw from "vite-plugin-rsw";

export default defineConfig({
  plugins: [
    ViteRsw({
      crates: ["gol-backend"],
    }),
  ],
  base: "/wasm-gol/",
});
