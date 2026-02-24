import { copyFileSync, mkdirSync } from "node:fs";
import { defineConfig } from "vitest/config";

import { createBuildConfig, createTestConfig, versionDefine } from "../../vite.config.base.ts";

export default defineConfig({
  define: versionDefine(),
  build: createBuildConfig({
    entry: {
      index: "./src/index.ts",
      server: "./src/server.ts",
      auth: "./src/auth.ts",
      http: "./src/http.ts",
    },
    external: [
      /^@studiometa\/forge-api/,
      /^@studiometa\/forge-core/,
      /^@modelcontextprotocol\//,
      /^node:/,
      /^h3$/,
      /^h3\//,
    ],
  }),
  plugins: [
    {
      name: "copy-skills",
      closeBundle() {
        mkdirSync("dist/../skills", { recursive: true });
        copyFileSync("skills/SKILL.md", "dist/../skills/SKILL.md");
      },
    },
  ],
  test: createTestConfig({
    name: "mcp",
    coverageExclude: ["src/index.ts", "src/server.ts", "src/version.ts", "src/handlers/types.ts"],
    coverageThresholds: {
      statements: 80,
      branches: 70,
      functions: 80,
      lines: 80,
    },
  }),
});
