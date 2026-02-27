/**
 * Result of a name matching operation.
 * Provides both exact and partial matches for flexible consumption.
 */
export interface NameMatch<T> {
  /** Items whose name matches the query exactly (case-insensitive). */
  exact: T[];
  /** Items whose name contains the query (case-insensitive). Includes exact matches. */
  partial: T[];
}

/**
 * Match items by name using case-insensitive exact and partial matching.
 *
 * @param items - The items to search through.
 * @param query - The search query.
 * @param getName - Function to extract the name from an item.
 * @returns Object with exact and partial match arrays.
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
