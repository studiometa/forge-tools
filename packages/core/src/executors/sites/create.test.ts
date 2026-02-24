import { describe, expect, it } from "vitest";

import type { SiteResponse } from "@studiometa/forge-api";

import { createTestExecutorContext } from "../../context.ts";
import { createSite } from "./create.ts";

describe("createSite", () => {
  it("should create a site", async () => {
    const ctx = createTestExecutorContext({
      client: {
        post: async () => ({ site: { id: 99, name: "example.com" } }) as SiteResponse,
      } as never,
    });

    const result = await createSite(
      { server_id: "123", domain: "example.com", project_type: "php" },
      ctx,
    );

    expect(result.data.name).toBe("example.com");
  });
});
