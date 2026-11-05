import { describe, expect, it, vi } from "vitest";

import { mockListDocument } from "../../test-helpers.ts";
import { createTestExecutorContext } from "../../context.ts";
import { listDaemons } from "./list.ts";

describe("listDaemons", () => {
  it("should list daemons on a server", async () => {
    const ctx = createTestExecutorContext({
      client: {
        get: async () =>
          mockListDocument("background-processes", [
            {
              id: 1,
              attributes: {
                command: "php artisan queue:work",
                user: "forge",
                directory: null,
                processes: 1,
                status: "active",
                created_at: "2024-01-01T00:00:00.000000Z",
              },
            },
          ]),
      } as never,
      organizationSlug: "test-org",
    });
    const result = await listDaemons({ server_id: "1" }, ctx);
    expect(result.data).toHaveLength(1);
  });

  it("should handle empty list", async () => {
    const ctx = createTestExecutorContext({
      client: { get: async () => mockListDocument("background-processes", []) } as never,
      organizationSlug: "test-org",
    });
    const result = await listDaemons({ server_id: "1" }, ctx);
    expect(result.data).toHaveLength(0);
  });

  it("filters on the site when site_id is given", async () => {
    const get = vi.fn(async () => mockListDocument("background-processes", []));
    const ctx = createTestExecutorContext({ client: { get } as never, organizationSlug: "org" });

    await listDaemons({ server_id: "123", site_id: "456" }, ctx);

    expect(decodeURIComponent(get.mock.calls[0][0] as string)).toBe(
      "/orgs/org/servers/123/background-processes?filter[site_id]=456",
    );
  });

  it("follows the next pages", async () => {
    const first = mockListDocument("background-processes", []);
    const get = vi
      .fn()
      .mockResolvedValueOnce({ ...first, meta: { ...first.meta, next_cursor: "c2" } })
      .mockResolvedValueOnce(first);
    const ctx = createTestExecutorContext({ client: { get } as never, organizationSlug: "org" });

    await listDaemons({ server_id: "123" }, ctx);

    expect(get).toHaveBeenCalledTimes(2);
    expect(decodeURIComponent(get.mock.calls[1][0] as string)).toBe(
      "/orgs/org/servers/123/background-processes?page[cursor]=c2",
    );
  });
});
