import { defineConfig } from "vitest/config";

import { createBuildConfig, createTestConfig, versionDefine } from "../../vite.config.base.ts";

export default defineConfig({
  define: versionDefine(),
  build: createBuildConfig({
    entry: {
      index: "./src/index.ts",
      cli: "./src/cli.ts",
    },
    external: [/^@studiometa\/forge-api/, /^@studiometa\/forge-core/],
  }),
  test: createTestConfig({
    name: "cli",
    coverageExclude: ["src/cli.ts", "src/index.ts", "src/types.ts"],
    coverageThresholds: {
      statements: 80,
      branches: 70,
      functions: 85,
      lines: 80,
    },
  }),
});
