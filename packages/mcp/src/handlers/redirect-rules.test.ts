import { describe, expect, it } from "vitest";

import { mockDocument, mockListDocument } from "@studiometa/forge-core";

import type { HandlerContext } from "./types.ts";

import { handleRedirectRules } from "./redirect-rules.ts";

function makeRuleAttrs(overrides: Record<string, unknown> = {}) {
  return {
    from: "/old",
    to: "/new",
    type: "301",
    status: "active",
    created_at: "2024-01-01",
    updated_at: "2024-01-01",
    ...overrides,
  };
}

function createMockContext(): HandlerContext {
  return {
    executorContext: {
      organizationSlug: "test-org",
      client: {
        get: async (url: string) => {
          if (/\/redirect-rules\/\d+$/.test(url)) {
            return mockDocument(1, "redirect-rules", makeRuleAttrs());
          }
          return mockListDocument("redirect-rules", [
            { id: 1, attributes: makeRuleAttrs() as never },
          ]);
        },
        post: async () => {},
        delete: async () => {},
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
    expect(result.content[0].text).toContain("/old");
  });

  it("should get a redirect rule", async () => {
    const result = await handleRedirectRules(
      "get",
      { resource: "redirect-rules", action: "get", server_id: "1", site_id: "10", id: "1" },
      createMockContext(),
    );
    expect(result.isError).toBeUndefined();
    expect(result.content[0].text).toContain("/old");
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
    expect(result.content[0].text).toContain("Done");
  });

  it("should delete a redirect rule", async () => {
    const result = await handleRedirectRules(
      "delete",
      { resource: "redirect-rules", action: "delete", server_id: "1", site_id: "10", id: "1" },
      createMockContext(),
    );
    expect(result.isError).toBeUndefined();
    expect(result.content[0].text).toContain("deleted");
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
