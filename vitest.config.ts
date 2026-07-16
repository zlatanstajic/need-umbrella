import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "jsdom",
    globals: true,
    coverage: {
      provider: "v8",
      include: [
        "src/util.ts",
        "src/store.ts",
        "src/location.ts",
        "src/data.ts",
        "src/forecast.ts",
        "src/strings.ts",
        "src/constants.ts",
        "src/render.ts",
        "src/threshold.ts"
      ],
      exclude: [
        "src/app.ts",
        "src/dom.ts",
        "src/state.ts",
        "src/types.ts",
        "src/geo.ts",
        "**/*.test.ts",
        "vitest.config.ts"
      ],
      thresholds: { lines: 90 },
      reporter: ["text", "html"]
    }
  }
});
