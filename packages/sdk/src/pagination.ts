/**
 * Function that fetches a page of results.
 */
export type PageFetcher<T> = (page: number) => Promise<T[]>;

/**
 * Async paginated iterator that auto-fetches all pages.
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
  private perPage: number;

  constructor(fetchPage: PageFetcher<T>, perPage = 200) {
    this.fetchPage = fetchPage;
    this.perPage = perPage;
  }

  async *[Symbol.asyncIterator](): AsyncGenerator<T, void, undefined> {
    let page = 1;
    let hasMore = true;

    while (hasMore) {
      const items = await this.fetchPage(page);

      for (const item of items) {
        yield item;
      }

      // If we got fewer items than perPage, we've reached the last page
      hasMore = items.length >= this.perPage;

      page++;
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
