import { describe, expect, it, vi } from "vitest";

import { mockListDocument } from "../../test-helpers.ts";
import { createTestExecutorContext } from "../../context.ts";
import { listEvents } from "./list.ts";

const event = {
  description: "Adding database",
  ran_as: "forge",
  created_at: "2024-01-01T00:00:00Z",
  updated_at: "2024-01-01T00:00:00Z",
};

function context() {
  const get = vi.fn(async () => mockListDocument("events", [{ id: 1, attributes: event }]));
  const ctx = createTestExecutorContext({
    client: { get } as never,
    organizationSlug: "test-org",
  });
  return { ctx, get };
}

describe("listEvents", () => {
  it("should list the latest events of the organization", async () => {
    const { ctx, get } = context();

    const result = await listEvents({}, ctx);

    expect(get).toHaveBeenCalledWith("/orgs/test-org/events?sort=-created_at");
    expect(result.data).toEqual([{ id: 1, ...event }]);
  });

  it("should list the events of a server with filters", async () => {
    const { ctx, get } = context();

    await listEvents({ server_id: "12", initiated_by: "3", ran_as: "root" }, ctx);

    expect(get).toHaveBeenCalledWith(
      "/orgs/test-org/servers/12/events?sort=-created_at&filter%5Binitiated_by%5D=3&filter%5Bran_as%5D=root",
    );
  });
});
