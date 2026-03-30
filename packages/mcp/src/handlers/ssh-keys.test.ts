import { describe, expect, it } from "vitest";

import { mockDocument, mockListDocument } from "@studiometa/forge-core";

import type { HandlerContext } from "./types.ts";

import { handleSshKeys } from "./ssh-keys.ts";

function makeKeyAttrs(overrides: Record<string, unknown> = {}) {
  return {
    name: "deploy-key",
    user: "forge",
    status: "installed",
    created_by: null,
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
          if (url.match(/\/ssh-keys\/\d+$/)) {
            return mockDocument(1, "ssh-keys", makeKeyAttrs());
          }
          return mockListDocument("ssh-keys", [{ id: 1, attributes: makeKeyAttrs() as never }]);
        },
        post: async () => undefined,
        delete: async () => undefined,
      } as never,
    },
    compact: true,
  };
}

describe("handleSshKeys", () => {
  it("should list SSH keys", async () => {
    const result = await handleSshKeys(
      "list",
      { resource: "ssh-keys", action: "list", server_id: "1" },
      createMockContext(),
    );
    expect(result.isError).toBeUndefined();
    expect(result.content[0]!.text).toContain("deploy-key");
  });

  it("should get an SSH key", async () => {
    const result = await handleSshKeys(
      "get",
      { resource: "ssh-keys", action: "get", server_id: "1", id: "1" },
      createMockContext(),
    );
    expect(result.isError).toBeUndefined();
    expect(result.content[0]!.text).toContain("deploy-key");
  });

  it("should create an SSH key", async () => {
    const result = await handleSshKeys(
      "create",
      {
        resource: "ssh-keys",
        action: "create",
        server_id: "1",
        name: "ci-key",
        key: "ssh-rsa AAAA...",
      },
      createMockContext(),
    );
    expect(result.isError).toBeUndefined();
    expect(result.content[0]!.text).toContain("Done");
  });

  it("should delete an SSH key", async () => {
    const result = await handleSshKeys(
      "delete",
      { resource: "ssh-keys", action: "delete", server_id: "1", id: "1" },
      createMockContext(),
    );
    expect(result.isError).toBeUndefined();
    expect(result.content[0]!.text).toContain("deleted");
  });

  it("should require server_id for list", async () => {
    const result = await handleSshKeys(
      "list",
      { resource: "ssh-keys", action: "list" },
      createMockContext(),
    );
    expect(result.isError).toBe(true);
  });

  it("should handle unknown action", async () => {
    const result = await handleSshKeys(
      "unknown",
      { resource: "ssh-keys", action: "unknown", server_id: "1" },
      createMockContext(),
    );
    expect(result.isError).toBe(true);
  });

  it("should inject hints on get when includeHints=true", async () => {
    const ctx = createMockContext();
    ctx.compact = false;
    ctx.includeHints = true;

    const result = await handleSshKeys(
      "get",
      { resource: "ssh-keys", action: "get", server_id: "1", id: "1" },
      ctx,
    );
    expect(result.isError).toBeUndefined();
    const parsed = JSON.parse(result.content[0]!.text);
    expect(parsed._hints).toBeDefined();
    expect(parsed._hints.related_resources).toBeDefined();
  });
});
