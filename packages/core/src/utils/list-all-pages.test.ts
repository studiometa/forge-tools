import * as v from "valibot";
import { describe, expect, it, vi } from "vitest";

import { createTestExecutorContext } from "../context.ts";
import { mockListDocument } from "../test-helpers.ts";
import { listAllPages } from "./list-all-pages.ts";

const route = { method: "GET", path: "/orgs/:org/things" } as const;
const schema = v.object({ name: v.string() });

function page(names: string[], firstId: number, nextCursor: string | null) {
  const doc = mockListDocument(
    "things",
    names.map((name, index) => ({ id: firstId + index, attributes: { name } })),
  );
  return { ...doc, meta: { ...doc.meta, next_cursor: nextCursor } };
}

describe("listAllPages", () => {
  it("returns a single page without a cursor request", async () => {
    const get = vi.fn(async () => page(["a"], 1, null));
    const ctx = createTestExecutorContext({ client: { get } as never, organizationSlug: "org" });

    const items = await listAllPages(route, ctx, {}, schema);

    expect(items).toEqual([{ id: 1, name: "a" }]);
    expect(get).toHaveBeenCalledTimes(1);
    expect(get).toHaveBeenCalledWith("/orgs/org/things");
  });

  it("follows next_cursor and keeps the query on every page", async () => {
    const get = vi
      .fn()
      .mockResolvedValueOnce(page(["a", "b"], 1, "c2"))
      .mockResolvedValueOnce(page(["c"], 3, "c3"))
      .mockResolvedValueOnce(page([], 4, null));
    const ctx = createTestExecutorContext({ client: { get } as never, organizationSlug: "org" });

    const items = await listAllPages(route, ctx, {}, schema, { "filter[user]": "forge" });

    expect(items.map((item) => item.name)).toEqual(["a", "b", "c"]);
    expect(get.mock.calls.map(([url]) => decodeURIComponent(url))).toEqual([
      "/orgs/org/things?filter[user]=forge",
      "/orgs/org/things?filter[user]=forge&page[cursor]=c2",
      "/orgs/org/things?filter[user]=forge&page[cursor]=c3",
    ]);
  });
});
