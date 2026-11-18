import { describe, expect, it, vi } from "vitest";

import { mockDocument } from "../../test-helpers.ts";
import { createTestExecutorContext } from "../../context.ts";
import { getEvent } from "./get.ts";
import { getEventOutput } from "./get-output.ts";

describe("getEvent", () => {
  it("should get an event of a server", async () => {
    const get = vi.fn(async () =>
      mockDocument(5, "events", {
        description: "Rebooting server",
        ran_as: null,
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-01T00:00:00Z",
      }),
    );
    const ctx = createTestExecutorContext({ client: { get } as never, organizationSlug: "o" });

    const result = await getEvent({ server_id: "12", id: "5" }, ctx);

    expect(get).toHaveBeenCalledWith("/orgs/o/servers/12/events/5");
    expect(result.data).toMatchObject({ id: 5, description: "Rebooting server" });
  });
});

describe("getEventOutput", () => {
  it("should get the output of an event", async () => {
    const get = vi.fn(async () => mockDocument(5, "eventOutputs", { output: "Done." }));
    const ctx = createTestExecutorContext({ client: { get } as never, organizationSlug: "o" });

    const result = await getEventOutput({ server_id: "12", id: "5" }, ctx);

    expect(get).toHaveBeenCalledWith("/orgs/o/servers/12/events/5/output");
    expect(result.data).toBe("Done.");
  });
});
