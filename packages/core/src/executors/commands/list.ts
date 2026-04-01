import type { CommandAttributes } from "@studiometa/forge-api";
import {
  unwrapListDocument,
  jsonApiListDocumentSchema,
  CommandAttributesSchema,
} from "@studiometa/forge-api";
import type { ExecutorContext, ExecutorResult } from "../../context.ts";
import { ROUTES, request } from "../../routes.ts";

import type { ListCommandsOptions } from "./types.ts";

/**
 * List commands executed on a site.
 */
export async function listCommands(
  options: ListCommandsOptions,
  ctx: ExecutorContext,
): Promise<ExecutorResult<Array<CommandAttributes & { id: number }>>> {
  const response = await request(
    ROUTES.commands.list,
    ctx,
    { server_id: options.server_id, site_id: options.site_id },
    { schema: jsonApiListDocumentSchema(CommandAttributesSchema) },
  );

  return {
    data: unwrapListDocument(response),
  };
}
