import { describe, expect, it } from "vitest";

import { mockDocument, mockListDocument } from "@studiometa/forge-core";

import type { HandlerContext } from "./types.ts";

import { handleSecurityRules } from "./security-rules.ts";

function makeRuleAttrs(overrides: Record<string, unknown> = {}) {
  return {
    name: "admin",
    path: "/admin",
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
          if (url.match(/\/security-rules\/\d+$/)) {
            return mockDocument(1, "security-rules", makeRuleAttrs());
          }
          return mockListDocument("security-rules", [
            { id: 1, attributes: makeRuleAttrs() as never },
          ]);
        },
        post: async () =>
          mockDocument(2, "security-rules", makeRuleAttrs({ name: "secret", path: "/secret" })),
        delete: async () => undefined,
      } as never,
    },
    compact: true,
  };
}

describe("handleSecurityRules", () => {
  it("should list security rules", async () => {
    const result = await handleSecurityRules(
      "list",
      { resource: "security-rules", action: "list", server_id: "1", site_id: "10" },
      createMockContext(),
    );
    expect(result.isError).toBeUndefined();
    expect(result.content[0]!.text).toContain("admin");
  });

  it("should get a security rule", async () => {
    const result = await handleSecurityRules(
      "get",
      { resource: "security-rules", action: "get", server_id: "1", site_id: "10", id: "1" },
      createMockContext(),
    );
    expect(result.isError).toBeUndefined();
    expect(result.content[0]!.text).toContain("admin");
  });

  it("should create a security rule", async () => {
    const result = await handleSecurityRules(
      "create",
      {
        resource: "security-rules",
        action: "create",
        server_id: "1",
        site_id: "10",
        name: "secret",
        credentials: [{ username: "user", password: "pass" }],
      },
      createMockContext(),
    );
    expect(result.isError).toBeUndefined();
    expect(result.content[0]!.text).toContain("secret");
  });

  it("should delete a security rule", async () => {
    const result = await handleSecurityRules(
      "delete",
      { resource: "security-rules", action: "delete", server_id: "1", site_id: "10", id: "1" },
      createMockContext(),
    );
    expect(result.isError).toBeUndefined();
    expect(result.content[0]!.text).toContain("deleted");
  });

  it("should require server_id and site_id for list", async () => {
    const result = await handleSecurityRules(
      "list",
      { resource: "security-rules", action: "list" },
      createMockContext(),
    );
    expect(result.isError).toBe(true);
  });

  it("should handle unknown action", async () => {
    const result = await handleSecurityRules(
      "unknown",
      { resource: "security-rules", action: "unknown", server_id: "1", site_id: "10" },
      createMockContext(),
    );
    expect(result.isError).toBe(true);
  });
});
