import { defineConfig } from "vitest/config";

import { createBuildConfig, createTestConfig, versionDefine } from "../../vite.config.base.ts";

export default defineConfig({
  define: versionDefine(),
  build: createBuildConfig({
    entry: { index: "./src/index.ts" },
    external: [/^@studiometa\/forge-api/, /^@studiometa\/forge-core/, /^@modelcontextprotocol\//],
  }),
  test: createTestConfig({
    name: "mcp",
    coverageExclude: ["src/index.ts", "src/version.ts"],
    coverageThresholds: {
      statements: 80,
      branches: 70,
      functions: 80,
      lines: 80,
    },
  }),
});
