import { describe, expect, it } from "vitest";

import { mockDocument } from "@studiometa/forge-core";

import type { HandlerContext } from "./types.ts";

import { handleEnv } from "./env.ts";

function createMockContext(compact = true): HandlerContext {
  return {
    executorContext: {
      organizationSlug: "test-org",
      client: {
        get: async () =>
          mockDocument(1, "environments", { content: "APP_ENV=production\nAPP_KEY=abc123" }),
        put: async () => ({}),
      } as never,
    },
    compact,
  };
}

/** Everything a client can see: the text and the structured content. */
function visible(result: Awaited<ReturnType<typeof handleEnv>>): string {
  return JSON.stringify([result.content, result.structuredContent]);
}

describe("handleEnv", () => {
  it("should get environment variables", async () => {
    const result = await handleEnv(
      "get",
      { resource: "env", action: "get", server_id: "1", site_id: "10" },
      createMockContext(),
    );
    expect(result.isError).toBeUndefined();
    expect(result.content[0].text).toContain("APP_ENV=production");
  });

  it("should update environment variables", async () => {
    const result = await handleEnv(
      "update",
      {
        resource: "env",
        action: "update",
        server_id: "1",
        site_id: "10",
        content: "APP_ENV=production",
      },
      createMockContext(),
    );
    expect(result.isError).toBeUndefined();
    expect(result.content[0].text).toContain("Environment variables updated");
  });

  it("should require server_id and site_id for get", async () => {
    const result = await handleEnv("get", { resource: "env", action: "get" }, createMockContext());
    expect(result.isError).toBe(true);
  });

  it("should handle unknown action", async () => {
    const result = await handleEnv(
      "unknown",
      { resource: "env", action: "unknown", server_id: "1", site_id: "10" },
      createMockContext(),
    );
    expect(result.isError).toBe(true);
  });
});

describe("handleEnv check", () => {
  const args = { resource: "env", action: "check", server_id: "1", site_id: "10" };

  it("should report in sync when the variables are the same", async () => {
    const result = await handleEnv(
      "check",
      { ...args, content: "# local\nAPP_KEY=abc123\nAPP_ENV=production\n" },
      createMockContext(false),
    );
    expect(result.isError).toBeUndefined();
    expect(result.structuredContent).toEqual({ success: true, result: { inSync: true } });
  });

  it("should return names only, never values", async () => {
    const result = await handleEnv(
      "check",
      { ...args, content: "APP_ENV=local-secret\nNEW_KEY=new-secret" },
      createMockContext(false),
    );
    expect(result.structuredContent).toEqual({
      success: true,
      result: {
        inSync: false,
        diff: { added: ["NEW_KEY"], removed: ["APP_KEY"], changed: ["APP_ENV"] },
      },
    });
    expect(visible(result)).not.toMatch(/secret|abc123|production/);
  });

  it("should format the names in compact output", async () => {
    const result = await handleEnv(
      "check",
      { ...args, content: "APP_ENV=local-secret\nNEW_KEY=new-secret" },
      createMockContext(),
    );
    expect(result.content[0].text).toBe(
      "Environment file differs from Forge:\n+ NEW_KEY (added)\n- APP_KEY (removed)\n~ APP_ENV (changed)",
    );
    expect(visible(result)).not.toMatch(/secret|abc123|production/);
  });

  it("should say in sync in compact output", async () => {
    const result = await handleEnv(
      "check",
      { ...args, content: "APP_ENV=production\nAPP_KEY=abc123" },
      createMockContext(),
    );
    expect(result.content[0].text).toBe("Environment file is in sync with Forge.");
  });

  it("should require content", async () => {
    const result = await handleEnv("check", args, createMockContext());
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain("content");
  });

  it("should not repeat a content that is not a string in the error", async () => {
    for (const content of [123456789, ["SECRET=leaked-value"], { SECRET: "leaked-value" }]) {
      const result = await handleEnv("check", { ...args, content }, createMockContext());
      expect(result.isError).toBe(true);
      expect(visible(result)).toContain("Expected the content as a string.");
      expect(visible(result)).not.toMatch(/123456789|leaked-value/);
    }
  });
});
