import type { CommandAttributes } from "@studiometa/forge-api";
import {
  unwrapDocument,
  jsonApiDocumentSchema,
  CommandAttributesSchema,
} from "@studiometa/forge-api";
import type { ExecutorContext, ExecutorResult } from "../../context.ts";
import { ROUTES, request } from "../../routes.ts";

import type { GetCommandOptions } from "./types.ts";

/**
 * Get a specific command.
 */
export async function getCommand(
  options: GetCommandOptions,
  ctx: ExecutorContext,
): Promise<ExecutorResult<CommandAttributes & { id: number }>> {
  const response = await request(
    ROUTES.commands.get,
    ctx,
    { server_id: options.server_id, site_id: options.site_id, id: options.id },
    { schema: jsonApiDocumentSchema(CommandAttributesSchema) },
  );

  return {
    data: unwrapDocument(response),
  };
}
