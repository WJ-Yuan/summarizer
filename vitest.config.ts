import path from "path"
import { defineConfig, mergeConfig } from "vite"
import viteConfig from "./vite.config"

export default defineConfig((configEnv) =>
  mergeConfig(
    viteConfig(configEnv),
    defineConfig({
      test: {
        globals: true,
        environment: "jsdom",
        include: ["**/*.{test,spec}.?(c|m)[jt]s?(x)"]
      },
      resolve: {
        alias: {
          "webextension-polyfill": path.resolve(
            "src/__test__/virtual/browser.ts"
          )
        }
      }
    })
  )
)
