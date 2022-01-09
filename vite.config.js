import { defineConfig } from "vite";
import ViteRsw from "vite-plugin-rsw";

export default defineConfig(({ mode }) => {
  if (mode == "development") {
    return {
      plugins: [
        ViteRsw({
          crates: ["gol-backend"],
          profile: "dev",
        }),
      ],
      base: "/wasm-gol/",
    };
  } else {
    return {
      plugins: [
        ViteRsw({
          crates: ["gol-backend"],
          profile: "release",
        }),
      ],
      base: "/wasm-gol/",
    };
  }
});
