import { describe, expect, it, vi } from "vitest";

import { AsyncPaginatedIterator } from "./pagination.ts";

describe("AsyncPaginatedIterator", () => {
  it("iterates across multiple pages using cursors", async () => {
    const fetcher = vi
      .fn()
      .mockResolvedValueOnce({ items: ["a", "b"], nextCursor: "cursor-2" })
      .mockResolvedValueOnce({ items: ["c", "d"], nextCursor: "cursor-3" })
      .mockResolvedValueOnce({ items: ["e"], nextCursor: null });

    const iter = new AsyncPaginatedIterator(fetcher);
    const results: string[] = [];
    for await (const item of iter) {
      results.push(item);
    }

    expect(results).toEqual(["a", "b", "c", "d", "e"]);
    expect(fetcher).toHaveBeenCalledTimes(3);
    expect(fetcher).toHaveBeenNthCalledWith(1, null);
    expect(fetcher).toHaveBeenNthCalledWith(2, "cursor-2");
    expect(fetcher).toHaveBeenNthCalledWith(3, "cursor-3");
  });

  it("stops when nextCursor is null", async () => {
    const fetcher = vi
      .fn()
      .mockResolvedValueOnce({ items: ["a", "b", "c"], nextCursor: "cursor-2" })
      .mockResolvedValueOnce({ items: ["d", "e"], nextCursor: null });

    const iter = new AsyncPaginatedIterator(fetcher);
    const results: string[] = [];
    for await (const item of iter) {
      results.push(item);
    }

    expect(results).toEqual(["a", "b", "c", "d", "e"]);
    expect(fetcher).toHaveBeenCalledTimes(2);
  });

  it("handles single page result", async () => {
    const fetcher = vi.fn().mockResolvedValueOnce({ items: ["x", "y"], nextCursor: null });

    const iter = new AsyncPaginatedIterator(fetcher);
    const results: string[] = [];
    for await (const item of iter) {
      results.push(item);
    }

    expect(results).toEqual(["x", "y"]);
    expect(fetcher).toHaveBeenCalledTimes(1);
  });

  it("handles empty first page", async () => {
    const fetcher = vi.fn().mockResolvedValueOnce({ items: [], nextCursor: null });

    const iter = new AsyncPaginatedIterator(fetcher);
    const results: string[] = [];
    for await (const item of iter) {
      results.push(item);
    }

    expect(results).toEqual([]);
    expect(fetcher).toHaveBeenCalledTimes(1);
  });

  it("toArray() collects all items", async () => {
    const fetcher = vi
      .fn()
      .mockResolvedValueOnce({ items: [1, 2, 3], nextCursor: "cursor-2" })
      .mockResolvedValueOnce({ items: [4, 5], nextCursor: null });

    const iter = new AsyncPaginatedIterator(fetcher);
    const result = await iter.toArray();

    expect(result).toEqual([1, 2, 3, 4, 5]);
    expect(fetcher).toHaveBeenCalledTimes(2);
  });

  it("passes null for first page and cursor for subsequent pages", async () => {
    const page1 = Array.from({ length: 200 }, (_, i) => i);
    const page2 = [200, 201];
    const fetcher = vi
      .fn()
      .mockResolvedValueOnce({ items: page1, nextCursor: "abc123" })
      .mockResolvedValueOnce({ items: page2, nextCursor: null });

    const iter = new AsyncPaginatedIterator(fetcher);
    const result = await iter.toArray();

    expect(result).toHaveLength(202);
    expect(fetcher).toHaveBeenCalledTimes(2);
    expect(fetcher).toHaveBeenNthCalledWith(1, null);
    expect(fetcher).toHaveBeenNthCalledWith(2, "abc123");
  });
});
