import { describe, expect, it } from "vitest";

import { mockDocument, mockListDocument } from "@studiometa/forge-core";

import type { HandlerContext } from "./types.ts";

import { handleMonitors } from "./monitors.ts";

function makeMonitorAttrs(overrides: Record<string, unknown> = {}) {
  return {
    type: "cpu_load",
    operator: ">",
    threshold: 80,
    minutes: 5,
    state: "OK",
    state_changed_at: "2024-01-01",
    ...overrides,
  };
}

function createMockContext(): HandlerContext {
  return {
    executorContext: {
      organizationSlug: "test-org",
      client: {
        get: async (url: string) => {
          if (url.match(/\/monitors\/\d+$/)) {
            return mockDocument(1, "monitors", makeMonitorAttrs());
          }
          return mockListDocument("monitors", [{ id: 1, attributes: makeMonitorAttrs() as never }]);
        },
        post: async () =>
          mockDocument(
            2,
            "monitors",
            makeMonitorAttrs({ type: "disk", threshold: 90, minutes: 1 }),
          ),
        delete: async () => undefined,
      } as never,
    },
    compact: true,
  };
}

describe("handleMonitors", () => {
  it("should list monitors", async () => {
    const result = await handleMonitors(
      "list",
      { resource: "monitors", action: "list", server_id: "1" },
      createMockContext(),
    );
    expect(result.isError).toBeUndefined();
    expect(result.content[0]!.text).toContain("cpu_load");
  });

  it("should get a monitor", async () => {
    const result = await handleMonitors(
      "get",
      { resource: "monitors", action: "get", server_id: "1", id: "1" },
      createMockContext(),
    );
    expect(result.isError).toBeUndefined();
    expect(result.content[0]!.text).toContain("cpu_load");
  });

  it("should create a monitor", async () => {
    const result = await handleMonitors(
      "create",
      {
        resource: "monitors",
        action: "create",
        server_id: "1",
        type: "disk",
        operator: ">",
        threshold: "90",
        minutes: "1",
      },
      createMockContext(),
    );
    expect(result.isError).toBeUndefined();
    expect(result.content[0]!.text).toContain("disk");
  });

  it("should delete a monitor", async () => {
    const result = await handleMonitors(
      "delete",
      { resource: "monitors", action: "delete", server_id: "1", id: "1" },
      createMockContext(),
    );
    expect(result.isError).toBeUndefined();
    expect(result.content[0]!.text).toContain("deleted");
  });

  it("should require server_id for list", async () => {
    const result = await handleMonitors(
      "list",
      { resource: "monitors", action: "list" },
      createMockContext(),
    );
    expect(result.isError).toBe(true);
  });

  it("should handle unknown action", async () => {
    const result = await handleMonitors(
      "unknown",
      { resource: "monitors", action: "unknown", server_id: "1" },
      createMockContext(),
    );
    expect(result.isError).toBe(true);
  });
});
