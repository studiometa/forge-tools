import { describe, expect, it } from "vitest";

import type { HandlerContext } from "./types.ts";

import { handleMonitors } from "./monitors.ts";

function createMockContext(): HandlerContext {
  return {
    executorContext: {
      client: {
        get: async () => ({
          monitors: [{ id: 1, type: "cpu_load", operator: ">", threshold: 80, state: "OK" }],
          monitor: {
            id: 1,
            type: "cpu_load",
            operator: ">",
            threshold: 80,
            minutes: 5,
            state: "OK",
          },
        }),
        post: async () => ({
          monitor: { id: 2, type: "disk", operator: ">", threshold: 90, minutes: 1, state: "OK" },
        }),
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
