import type { JsonApiDocument, UserAttributes } from "@studiometa/forge-api";
import { unwrapDocument } from "@studiometa/forge-api";
import type { ExecutorContext, ExecutorResult } from "../../context.ts";

import type { GetUserOptions } from "./types.ts";

/**
 * Get the currently authenticated user.
 */
export async function getUser(
  _options: GetUserOptions,
  ctx: ExecutorContext,
): Promise<ExecutorResult<UserAttributes & { id: number }>> {
  const response = await ctx.client.get<JsonApiDocument<UserAttributes>>("/user");

  return {
    data: unwrapDocument(response),
  };
}
