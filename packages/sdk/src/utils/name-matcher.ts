/**
 * Result of a name matching operation.
 */
export interface NameMatch<T> {
  exact: T[];
  partial: T[];
}

/**
 * Match items by name using case-insensitive exact and partial matching.
 */
export function matchByName<T>(
  items: T[],
  query: string,
  getName: (item: T) => string,
): NameMatch<T> {
  const lower = query.toLowerCase();
  const exact = items.filter((item) => getName(item).toLowerCase() === lower);
  const partial = items.filter((item) => getName(item).toLowerCase().includes(lower));
  return { exact, partial };
}
