// ── JSON:API response types for Forge v2 API ─────────

/**
 * A JSON:API resource object.
 *
 * All v2 resources follow this structure:
 * `{ id: string, type: string, attributes: T, relationships?: {...}, links: {...} }`
 */
export interface JsonApiResource<T> {
  id: string;
  type: string;
  attributes: T;
  relationships?: Record<string, JsonApiRelationship>;
  links?: {
    self?: JsonApiLink;
  };
}

/**
 * A JSON:API relationship object.
 */
export interface JsonApiRelationship {
  data: JsonApiResourceIdentifier | JsonApiResourceIdentifier[] | null;
}

/**
 * A JSON:API resource identifier (type + id reference).
 */
export interface JsonApiResourceIdentifier {
  type: string;
  id: string;
}

/**
 * A JSON:API link object.
 */
export interface JsonApiLink {
  href: string;
  rel?: string;
  describedby?: string;
  title?: string;
  type?: string;
  hreflang?: string;
}

/**
 * A JSON:API document with a single resource.
 */
export interface JsonApiDocument<T> {
  data: JsonApiResource<T>;
}

/**
 * A JSON:API document with a collection of resources (paginated).
 */
export interface JsonApiListDocument<T> {
  data: JsonApiResource<T>[];
  links: JsonApiPaginationLinks;
  meta: JsonApiPaginationMeta;
}

/**
 * Pagination links in a JSON:API list response.
 */
export interface JsonApiPaginationLinks {
  first?: string | null;
  last?: string | null;
  prev?: string | null;
  next?: string | null;
}

/**
 * Pagination metadata in a JSON:API list response.
 */
export interface JsonApiPaginationMeta {
  path?: string | null;
  per_page: number;
  next_cursor?: string | null;
  prev_cursor?: string | null;
}
