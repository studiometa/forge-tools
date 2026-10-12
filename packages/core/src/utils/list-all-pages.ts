import type * as v from "valibot";

import type { JsonApiListDocument } from "@studiometa/forge-api";
import { jsonApiListDocumentSchema, unwrapListDocument } from "@studiometa/forge-api";

import type { ExecutorContext } from "../context.ts";
import type { RouteDefinition, RouteParams } from "../routes.ts";
import { request } from "../routes.ts";

/**
 * GET every page of a cursor-paginated list route and return all its resources.
 * Follows `meta.next_cursor` until the API returns no cursor.
 */
export async function listAllPages<T>(
  route: RouteDefinition,
  ctx: ExecutorContext,
  params: RouteParams,
  attributes: v.GenericSchema<unknown, T>,
  query: Record<string, string> = {},
): Promise<Array<T & { id: number }>> {
  const schema = jsonApiListDocumentSchema(attributes);
  const items: Array<T & { id: number }> = [];
  let cursor: string | null | undefined;

  do {
    const response = (await request(route, ctx, params, {
      schema,
      query: cursor ? { ...query, "page[cursor]": cursor } : query,
    })) as JsonApiListDocument<T>;
    items.push(...unwrapListDocument(response));
    cursor = response.meta.next_cursor;
  } while (cursor);

  return items;
}
