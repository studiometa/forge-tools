import { describe, expect, it } from "vitest";

import type { SitesResponse } from "@studiometa/forge-api";

import { createTestExecutorContext } from "../../context.ts";
import { listSites } from "./list.ts";

describe("listSites", () => {
  it("should list sites and format output", async () => {
    const sites = [
      { id: 1, name: "example.com", project_type: "php", status: "installed" },
      { id: 2, name: "api.example.com", project_type: "php", status: "installed" },
    ];

    const ctx = createTestExecutorContext({
      client: {
        get: async () => ({ sites }) as SitesResponse,
      } as never,
    });

    const result = await listSites({ server_id: "123" }, ctx);

    expect(result.data).toHaveLength(2);
    expect(result.text).toContain("2 site(s)");
    expect(result.text).toContain("example.com");
  });

  it("should handle empty site list", async () => {
    const ctx = createTestExecutorContext({
      client: {
        get: async () => ({ sites: [] }) as SitesResponse,
      } as never,
    });

    const result = await listSites({ server_id: "123" }, ctx);

    expect(result.data).toHaveLength(0);
    expect(result.text).toContain("No sites");
  });
});
