import { describe, expect, it } from "vitest";

import type { SiteResponse } from "@studiometa/forge-api";

import { createTestExecutorContext } from "../../context.ts";
import { getSite } from "./get.ts";

describe("getSite", () => {
  it("should get a site and format output", async () => {
    const site = {
      id: 456,
      name: "example.com",
      project_type: "php",
      directory: "/public",
      repository: "user/repo",
      repository_branch: "main",
      status: "installed",
      deployment_status: null,
      quick_deploy: true,
      php_version: "php83",
      created_at: "2024-01-01T00:00:00.000000Z",
    };

    const ctx = createTestExecutorContext({
      client: {
        get: async () => ({ site }) as SiteResponse,
      } as never,
    });

    const result = await getSite({ server_id: "123", site_id: "456" }, ctx);

    expect(result.data.name).toBe("example.com");
    expect(result.text).toContain("example.com");
    expect(result.text).toContain("/public");
    expect(result.text).toContain("user/repo");
  });
});
