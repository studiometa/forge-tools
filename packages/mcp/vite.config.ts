import { defineConfig } from "vitest/config";

import { createBuildConfig, createTestConfig } from "../../vite.config.base.ts";

export default defineConfig({
  build: createBuildConfig({
    entry: { index: "./src/index.ts" },
    external: [/^@studiometa\/forge-api/, /^@studiometa\/forge-core/],
  }),
  test: createTestConfig({
    name: "mcp",
    coverageExclude: ["src/index.ts"],
    coverageThresholds: {
      statements: 90,
      branches: 80,
      functions: 90,
      lines: 90,
    },
  }),
});
