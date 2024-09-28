/// <reference types="vitest" />

import { dirname, relative } from "node:path"
import react from "@vitejs/plugin-react"
import type { UserConfig } from "vite"
import { defineConfig } from "vite"
import svgr from "vite-plugin-svgr"
import packageJson from "./package.json"
import { isDev, port, r } from "./scripts/utils"

export const sharedConfig: UserConfig = {
  root: r("src"),
  resolve: {
    alias: {
      "~/": `${r("src")}/`
    }
  },
  define: {
    __DEV__: isDev,
    __NAME__: JSON.stringify(packageJson.name)
  },
  plugins: [
    react(),
    // rewrite assets to use relative path
    {
      name: "assets-rewrite",
      enforce: "post",
      apply: "build",
      transformIndexHtml(html, { path }) {
        return html.replace(
          /"\/assets\//g,
          `"${relative(dirname(path), "/assets")}/`
        )
      }
    },
    svgr()
  ],
  optimizeDeps: {
    include: ["react", "webextension-polyfill"]
  }
}

export default defineConfig(({ command }) => ({
  ...sharedConfig,
  base: command === "serve" ? `http://localhost:${port}/` : "/dist/",
  server: {
    port,
    hmr: {
      host: "localhost"
    }
  },
  build: {
    watch: isDev ? {} : undefined,
    outDir: r("extension/dist"),
    emptyOutDir: false,
    sourcemap: isDev ? "inline" : false,
    // https://developer.chrome.com/docs/webstore/program_policies/#:~:text=Code%20Readability%20Requirements
    terserOptions: {
      mangle: false
    },
    rollupOptions: {
      input: {
        options: r("src/options/index.html"),
        sidepanel: r("src/sidepanel/index.html")
      }
    }
  }
}))
