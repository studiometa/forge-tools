import { describe, expect, it } from "vitest";

import type { HandlerContext } from "./types.ts";

import { handleSecurityRules } from "./security-rules.ts";

function createMockContext(): HandlerContext {
  return {
    executorContext: {
      client: {
        get: async () => ({
          security_rules: [
            {
              id: 1,
              name: "admin",
              path: "/admin",
              credentials: [],
              server_id: 1,
              site_id: 10,
              created_at: "2024-01-01",
            },
          ],
          security_rule: {
            id: 1,
            name: "admin",
            path: "/admin",
            credentials: [],
            server_id: 1,
            site_id: 10,
            created_at: "2024-01-01",
          },
        }),
        post: async () => ({
          security_rule: {
            id: 2,
            name: "secret",
            path: "/secret",
            credentials: [],
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
