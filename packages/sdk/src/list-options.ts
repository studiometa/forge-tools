/**
 * Options of a list request: cursor pagination, page size, filters, sort and includes, as
 * the Forge API takes them (`page[cursor]`, `page[size]`, `filter[...]`, `sort`, `include`).
 *
 * @typeParam TFilter - The fields that the list can be filtered by.
 * @typeParam TSort - The fields that the list can be sorted by; prefix with `-` for descending.
 * @typeParam TInclude - The relationships that the list can include.
 *
 * @example
 * ```ts
 * await forge.servers.list({ filter: { name: 'web' }, sort: ['-created_at'], pageSize: 50 });
 * ```
 */
export interface ListOptions<
  TFilter extends string = never,
  TSort extends string = never,
  TInclude extends string = never,
> {
  /** Cursor for pagination (from previous response's next_cursor). */
  cursor?: string;
  /** Number of results per page. */
  pageSize?: number;
  /** Filter the results by field. */
  filter?: Partial<Record<TFilter, string>>;
  /** Sort the results by these fields, `-field` for descending. */
  sort?: Array<TSort | `-${TSort}`>;
  /** Include these relationships. */
  include?: TInclude[];
}

/** List options without a cursor, for an iteration over all pages. */
export type AllOptions<T extends ListOptions<string, string, string>> = Omit<T, "cursor">;

/**
 * Build the query string of a list request, with its leading `?`, or an empty string.
 */
export function listQuery(
  options: ListOptions<string, string, string>,
  cursor: string | null | undefined = options.cursor,
): string {
  const params: string[] = [];
  if (cursor) params.push(`page[cursor]=${encodeURIComponent(cursor)}`);
  if (options.pageSize !== undefined) params.push(`page[size]=${options.pageSize}`);
  for (const [field, value] of Object.entries(options.filter ?? {})) {
    if (value !== undefined) params.push(`filter[${field}]=${encodeURIComponent(value)}`);
  }
  if (options.sort?.length) params.push(`sort=${options.sort.join(",")}`);
  if (options.include?.length) params.push(`include=${options.include.join(",")}`);
  return params.length > 0 ? `?${params.join("&")}` : "";
}
