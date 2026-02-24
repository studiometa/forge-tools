import { describe, expect, it } from "vitest";

import type { HandlerContext } from "./types.ts";

import { handleFirewallRules } from "./firewall-rules.ts";

function createMockContext(): HandlerContext {
  return {
    executorContext: {
      client: {
        get: async () => ({
          rules: [
            {
              id: 1,
              name: "SSH",
              port: 22,
              type: "allow",
              ip_address: "0.0.0.0",
              status: "created",
            },
          ],
          rule: {
            id: 1,
            name: "SSH",
            port: 22,
            type: "allow",
            ip_address: "0.0.0.0",
            status: "created",
          },
        }),
        post: async () => ({
          rule: {
            id: 2,
            name: "HTTP",
            port: 80,
            type: "allow",
            ip_address: "0.0.0.0",
            status: "creating",
          },
        }),
        delete: async () => undefined,
      } as never,
    },
    compact: true,
  };
}

describe("handleFirewallRules", () => {
  it("should list firewall rules", async () => {
    const result = await handleFirewallRules(
      "list",
      { resource: "firewall-rules", action: "list", server_id: "1" },
      createMockContext(),
    );
    expect(result.isError).toBeUndefined();
    expect(result.content[0]!.text).toContain("SSH");
  });

  it("should get a firewall rule", async () => {
    const result = await handleFirewallRules(
      "get",
      { resource: "firewall-rules", action: "get", server_id: "1", id: "1" },
      createMockContext(),
    );
    expect(result.isError).toBeUndefined();
    expect(result.content[0]!.text).toContain("SSH");
  });

  it("should create a firewall rule", async () => {
    const result = await handleFirewallRules(
      "create",
      { resource: "firewall-rules", action: "create", server_id: "1", name: "HTTP", port: "80" },
      createMockContext(),
    );
    expect(result.isError).toBeUndefined();
    expect(result.content[0]!.text).toContain("HTTP");
  });

  it("should delete a firewall rule", async () => {
    const result = await handleFirewallRules(
      "delete",
      { resource: "firewall-rules", action: "delete", server_id: "1", id: "1" },
      createMockContext(),
    );
    expect(result.isError).toBeUndefined();
    expect(result.content[0]!.text).toContain("deleted");
  });

  it("should require server_id for list", async () => {
    const result = await handleFirewallRules(
      "list",
      { resource: "firewall-rules", action: "list" },
      createMockContext(),
    );
    expect(result.isError).toBe(true);
  });

  it("should handle unknown action", async () => {
    const result = await handleFirewallRules(
      "unknown",
      { resource: "firewall-rules", action: "unknown", server_id: "1" },
      createMockContext(),
    );
    expect(result.isError).toBe(true);
  });
});
