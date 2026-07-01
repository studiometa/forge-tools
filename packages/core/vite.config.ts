import { defineConfig } from "vitest/config";

import { createBuildConfig, createTestConfig } from "../../vite.config.base.ts";

export default defineConfig({
  build: createBuildConfig({
    entry: { index: "./src/index.ts" },
    // Keep pino external so Node resolves its real (node) build at runtime.
    // Bundling it makes Vite pick pino's "browser" build, which logs to the
    // console instead of the audit file.
    external: [/^@studiometa\/forge-api/, "pino"],
  }),
  test: createTestConfig({
    name: "core",
    coverageExclude: [
      "src/index.ts",
      "src/executors/types.ts",
      "src/executors/*/index.ts",
      "src/executors/*/types.ts",
    ],
    coverageThresholds: {
      statements: 90,
      branches: 80,
      functions: 90,
      lines: 90,
    },
  }),
});
