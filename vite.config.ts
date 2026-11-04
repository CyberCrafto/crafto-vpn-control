import path from "path";
import { fileURLToPath } from "url";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { viteSingleFile } from "vite-plugin-singlefile";
import fs from "node:fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * `VITE_BASE_PATH` lets the same build run on a project page
 * (https://user.github.io/<repo>/) *and* on a custom domain or
 * localhost. GitHub Actions sets it automatically from the repository
 * name so no value has to be committed here.
 *
 * Output is 100% static: the JS/CSS bundle is inlined into a single
 * dist/index.html, so the site works on GitHub Pages, on any sub-path
 * and when the file is opened directly — no server runtime required.
 */
export default defineConfig({
  base: process.env.VITE_BASE_PATH || "/",
  plugins: [
    react(),
    tailwindcss(),
    viteSingleFile(),
    {
      name: "crafto-static-output",
      closeBundle() {
        // GitHub Pages serves 404.html for unknown paths. Copying the
        // built shell keeps deep links / refreshed routes working.
        const source = path.resolve(__dirname, "dist/index.html");
        if (fs.existsSync(source)) {
          fs.copyFileSync(source, path.resolve(__dirname, "dist/404.html"));
        }
      },
    },
  ],
  build: {
    outDir: "dist",
    sourcemap: false,
    cssCodeSplit: false,
    emptyOutDir: true,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
});
