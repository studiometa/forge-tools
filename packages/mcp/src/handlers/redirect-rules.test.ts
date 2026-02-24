import { describe, expect, it } from "vitest";

import type { HandlerContext } from "./types.ts";

import { handleRedirectRules } from "./redirect-rules.ts";

function createMockContext(): HandlerContext {
  return {
    executorContext: {
      client: {
        get: async () => ({
          redirect_rules: [
            {
              id: 1,
              from: "/old",
              to: "/new",
              type: "301",
              server_id: 1,
              site_id: 10,
              created_at: "2024-01-01",
            },
          ],
          redirect_rule: {
            id: 1,
            from: "/old",
            to: "/new",
            type: "301",
            server_id: 1,
            site_id: 10,
            created_at: "2024-01-01",
          },
        }),
        post: async () => ({
          redirect_rule: {
            id: 2,
            from: "/src",
            to: "/dst",
            type: "302",
            server_id: 1,
            site_id: 10,
            created_at: "2024-01-01",
          },
        }),
        delete: async () => undefined,
      } as never,
    },
    compact: true,
  };
}

describe("handleRedirectRules", () => {
  it("should list redirect rules", async () => {
    const result = await handleRedirectRules(
      "list",
      { resource: "redirect-rules", action: "list", server_id: "1", site_id: "10" },
      createMockContext(),
    );
    expect(result.isError).toBeUndefined();
    expect(result.content[0]!.text).toContain("/old");
  });

  it("should get a redirect rule", async () => {
    const result = await handleRedirectRules(
      "get",
      { resource: "redirect-rules", action: "get", server_id: "1", site_id: "10", id: "1" },
      createMockContext(),
    );
    expect(result.isError).toBeUndefined();
    expect(result.content[0]!.text).toContain("/old");
  });

  it("should create a redirect rule", async () => {
    const result = await handleRedirectRules(
      "create",
      {
        resource: "redirect-rules",
        action: "create",
        server_id: "1",
        site_id: "10",
        from: "/src",
        to: "/dst",
      },
      createMockContext(),
    );
    expect(result.isError).toBeUndefined();
    expect(result.content[0]!.text).toContain("/src");
  });

  it("should delete a redirect rule", async () => {
    const result = await handleRedirectRules(
      "delete",
      { resource: "redirect-rules", action: "delete", server_id: "1", site_id: "10", id: "1" },
      createMockContext(),
    );
    expect(result.isError).toBeUndefined();
    expect(result.content[0]!.text).toContain("deleted");
  });

  it("should require server_id and site_id for list", async () => {
    const result = await handleRedirectRules(
      "list",
      { resource: "redirect-rules", action: "list" },
      createMockContext(),
    );
    expect(result.isError).toBe(true);
  });

  it("should handle unknown action", async () => {
    const result = await handleRedirectRules(
      "unknown",
      { resource: "redirect-rules", action: "unknown", server_id: "1", site_id: "10" },
      createMockContext(),
    );
    expect(result.isError).toBe(true);
  });
});
