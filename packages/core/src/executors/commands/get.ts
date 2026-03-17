import type { JsonApiDocument, CommandAttributes } from "@studiometa/forge-api";
import { unwrapDocument } from "@studiometa/forge-api";
import type { ExecutorContext, ExecutorResult } from "../../context.ts";
import { sitePath } from "../../utils/url-builder.ts";

import type { GetCommandOptions } from "./types.ts";

/**
 * Get a specific command.
 */
export async function getCommand(
  options: GetCommandOptions,
  ctx: ExecutorContext,
): Promise<ExecutorResult<CommandAttributes & { id: number }>> {
  const response = await ctx.client.get<JsonApiDocument<CommandAttributes>>(
    `${sitePath(options.server_id, options.site_id, ctx)}/commands/${options.id}`,
  );

  return {
    data: unwrapDocument(response),
  };
}
