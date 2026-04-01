import type { UserAttributes } from "@studiometa/forge-api";
import { unwrapDocument, jsonApiDocumentSchema, UserAttributesSchema } from "@studiometa/forge-api";
import type { ExecutorContext, ExecutorResult } from "../../context.ts";
import { ROUTES, request } from "../../routes.ts";

import type { GetUserOptions } from "./types.ts";

/**
 * Get the currently authenticated user.
 */
export async function getUser(
  _options: GetUserOptions,
  ctx: ExecutorContext,
): Promise<ExecutorResult<UserAttributes & { id: number }>> {
  const response = await request(
    ROUTES.user.get,
    ctx,
    {},
    { schema: jsonApiDocumentSchema(UserAttributesSchema) },
  );

  return {
    data: unwrapDocument(response),
  };
}
