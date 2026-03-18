import type { JsonApiDocument, JsonApiListDocument, JsonApiResource } from "../types/jsonapi.ts";

/**
 * Unwrap a single JSON:API resource to its attributes, adding the `id` field.
 *
 * @example
 * ```ts
 * const doc = await client.get<JsonApiDocument<ServerAttributes>>('/orgs/my-org/servers/1');
 * const server = unwrapResource(doc.data);
 * // { id: 1, name: "web-1", ... }
 * ```
 */
export function unwrapResource<T>(resource: JsonApiResource<T>): T & { id: number } {
  return {
    ...resource.attributes,
    id: Number(resource.id),
  };
}

/**
 * Unwrap a JSON:API document containing a single resource.
 */
export function unwrapDocument<T>(doc: JsonApiDocument<T>): T & { id: number } {
  return unwrapResource(doc.data);
}

/**
 * Unwrap a JSON:API list document to an array of attributes with `id`.
 */
export function unwrapListDocument<T>(doc: JsonApiListDocument<T>): Array<T & { id: number }> {
  return doc.data.map(unwrapResource);
}
