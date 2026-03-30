import type { JsonApiDocument, JsonApiListDocument, JsonApiResource } from "@studiometa/forge-api";

/**
 * Create a mock JSON:API resource.
 */
export function mockResource<T>(id: number, type: string, attributes: T): JsonApiResource<T> {
  return {
    id: String(id),
    type,
    attributes,
    links: { self: { href: `/api/${type}/${id}` } },
  };
}

/**
 * Create a mock JSON:API single-resource document.
 */
export function mockDocument<T>(id: number, type: string, attributes: T): JsonApiDocument<T> {
  return { data: mockResource(id, type, attributes) };
}

/**
 * Create a mock JSON:API list document.
 */
export function mockListDocument<T>(
  type: string,
  items: Array<{ id: number; attributes: T }>,
): JsonApiListDocument<T> {
  return {
    data: items.map((item) => mockResource(item.id, type, item.attributes)),
    links: { next: null, prev: null },
    meta: { per_page: 30, next_cursor: null, prev_cursor: null },
  };
}

/**
 * Create a test executor context with organizationSlug set.
 */
export { createTestExecutorContext } from "./context.ts";
