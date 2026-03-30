import type { JsonApiListDocument, CommandAttributes } from "@studiometa/forge-api";
import { unwrapListDocument } from "@studiometa/forge-api";
import type { ExecutorContext, ExecutorResult } from "../../context.ts";
import { sitePath } from "../../utils/url-builder.ts";

import type { ListCommandsOptions } from "./types.ts";

/**
 * List commands executed on a site.
 */
export async function listCommands(
  options: ListCommandsOptions,
  ctx: ExecutorContext,
): Promise<ExecutorResult<Array<CommandAttributes & { id: number }>>> {
  const response = await ctx.client.get<JsonApiListDocument<CommandAttributes>>(
    `${sitePath(options.server_id, options.site_id, ctx)}/commands`,
  );

  return {
    data: unwrapListDocument(response),
  };
}
