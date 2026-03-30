/**
 * Function that fetches a page of results using cursor-based pagination.
 * Pass `null` for the first page, or a cursor string for subsequent pages.
 */
export type PageFetcher<T> = (
  cursor: string | null,
) => Promise<{ items: T[]; nextCursor: string | null }>;

/**
 * Async paginated iterator that auto-fetches all pages using cursor-based pagination.
 *
 * @example
 * ```ts
 * const iter = forge.server(123).site(456).deployments.all();
 * for await (const deployment of iter) {
 *   console.log(deployment);
 * }
 *
 * // Or collect all items at once:
 * const deployments = await iter.toArray();
 * ```
 */
export class AsyncPaginatedIterator<T> {
  private fetchPage: PageFetcher<T>;

  constructor(fetchPage: PageFetcher<T>) {
    this.fetchPage = fetchPage;
  }

  async *[Symbol.asyncIterator](): AsyncGenerator<T, void, undefined> {
    let cursor: string | null = null;
    let hasMore = true;

    while (hasMore) {
      const { items, nextCursor } = await this.fetchPage(cursor);

      for (const item of items) {
        yield item;
      }

      if (nextCursor) {
        cursor = nextCursor;
      } else {
        hasMore = false;
      }
    }
  }

  /**
   * Collect all items into an array.
   *
   * @example
   * ```ts
   * const deployments = await forge.server(123).site(456).deployments.all().toArray();
   * ```
   */
  async toArray(): Promise<T[]> {
    const items: T[] = [];
    for await (const item of this) {
      items.push(item);
    }
    return items;
  }
}
