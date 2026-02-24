import { describe, expect, it, vi } from "vitest";

import { AsyncPaginatedIterator } from "./pagination.ts";

describe("AsyncPaginatedIterator", () => {
  it("iterates across multiple pages", async () => {
    const fetcher = vi
      .fn()
      .mockResolvedValueOnce(["a", "b"])
      .mockResolvedValueOnce(["c", "d"])
      .mockResolvedValueOnce(["e"]);

    const iter = new AsyncPaginatedIterator(fetcher, 2);
    const results: string[] = [];
    for await (const item of iter) {
      results.push(item);
    }

    expect(results).toEqual(["a", "b", "c", "d", "e"]);
    expect(fetcher).toHaveBeenCalledTimes(3);
    expect(fetcher).toHaveBeenNthCalledWith(1, 1);
    expect(fetcher).toHaveBeenNthCalledWith(2, 2);
    expect(fetcher).toHaveBeenNthCalledWith(3, 3);
  });

  it("stops when data.length < perPage", async () => {
    const fetcher = vi
      .fn()
      .mockResolvedValueOnce(["a", "b", "c"])
      .mockResolvedValueOnce(["d", "e"]);

    const iter = new AsyncPaginatedIterator(fetcher, 3);
    const results: string[] = [];
    for await (const item of iter) {
      results.push(item);
    }

    expect(results).toEqual(["a", "b", "c", "d", "e"]);
    expect(fetcher).toHaveBeenCalledTimes(2);
  });

  it("handles single page result", async () => {
    const fetcher = vi.fn().mockResolvedValueOnce(["x", "y"]);

    const iter = new AsyncPaginatedIterator(fetcher, 10);
    const results: string[] = [];
    for await (const item of iter) {
      results.push(item);
    }

    expect(results).toEqual(["x", "y"]);
    expect(fetcher).toHaveBeenCalledTimes(1);
  });

  it("handles empty first page", async () => {
    const fetcher = vi.fn().mockResolvedValueOnce([]);

    const iter = new AsyncPaginatedIterator(fetcher);
    const results: string[] = [];
    for await (const item of iter) {
      results.push(item);
    }

    expect(results).toEqual([]);
    expect(fetcher).toHaveBeenCalledTimes(1);
  });

  it("toArray() collects all items", async () => {
    const fetcher = vi.fn().mockResolvedValueOnce([1, 2, 3]).mockResolvedValueOnce([4, 5]);

    const iter = new AsyncPaginatedIterator(fetcher, 3);
    const result = await iter.toArray();

    expect(result).toEqual([1, 2, 3, 4, 5]);
    expect(fetcher).toHaveBeenCalledTimes(2);
  });

  it("uses default perPage of 200", async () => {
    // Return exactly 200 items — should trigger another fetch
    const page1 = Array.from({ length: 200 }, (_, i) => i);
    const page2 = [200, 201];
    const fetcher = vi.fn().mockResolvedValueOnce(page1).mockResolvedValueOnce(page2);

    const iter = new AsyncPaginatedIterator(fetcher);
    const result = await iter.toArray();

    expect(result).toHaveLength(202);
    expect(fetcher).toHaveBeenCalledTimes(2);
  });
});
