import { describe, expect, it, vi } from "vitest";

import { mockDocument, mockListDocument } from "@studiometa/forge-core";

import type { HandlerContext } from "./types.ts";

import { handleEvents } from "./events.ts";

const event = {
  description: "Adding database",
  ran_as: "forge",
  created_at: "2024-01-01",
  updated_at: "2024-01-01",
};

function context() {
  const get = vi.fn(async (url: string) => {
    if (url.endsWith("/output")) return mockDocument(5, "eventOutputs", { output: "Done." });
    if (/\/events\/\d+$/.test(url)) return mockDocument(5, "events", { ...event, ran_as: null });
    return mockListDocument("events", [{ id: 5, attributes: event }]);
  });
  const ctx: HandlerContext = {
    executorContext: { organizationSlug: "o", client: { get } as never },
    compact: true,
  };
  return { ctx, get };
}

describe("handleEvents", () => {
  it("should list the events of the organization", async () => {
    const { ctx, get } = context();
    const result = await handleEvents("list", { resource: "events", action: "list" }, ctx);
    expect(get).toHaveBeenCalledWith("/orgs/o/events?sort=-created_at");
    expect(result.content[0].text).toContain("#5 — Adding database (as forge)");
  });

  it("should list the events of a server with filters", async () => {
    const { ctx, get } = context();
    await handleEvents(
      "list",
      { resource: "events", action: "list", server_id: "1", initiated_by: "3", ran_as: "root" },
      ctx,
    );
    expect(get).toHaveBeenCalledWith(
      "/orgs/o/servers/1/events?sort=-created_at&filter%5Binitiated_by%5D=3&filter%5Bran_as%5D=root",
    );
  });

  it("should get an event and its output", async () => {
    const { ctx } = context();
    const args = { resource: "events", server_id: "1", id: "5" };
    const event = await handleEvents("get", { ...args, action: "get" }, ctx);
    expect(event.content[0].text).toContain("Event #5: Adding database");
    expect(event.content[0].text).toContain("Ran as: —");
    const output = await handleEvents("log", { ...args, action: "log" }, ctx);
    expect(output.content[0].text).toBe("Output of event #5:\nDone.");
  });

  it("should require server_id for get", async () => {
    const { ctx } = context();
    const result = await handleEvents("get", { resource: "events", action: "get", id: "5" }, ctx);
    expect(result.isError).toBe(true);
  });
});
