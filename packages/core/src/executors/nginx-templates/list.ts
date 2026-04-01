import type { NginxTemplateAttributes } from "@studiometa/forge-api";
import {
  unwrapListDocument,
  jsonApiListDocumentSchema,
  NginxTemplateAttributesSchema,
} from "@studiometa/forge-api";
import type { ExecutorContext, ExecutorResult } from "../../context.ts";
import { ROUTES, request } from "../../routes.ts";

import type { ListNginxTemplatesOptions } from "./types.ts";

/**
 * List Nginx templates on a server.
 */
export async function listNginxTemplates(
  options: ListNginxTemplatesOptions,
  ctx: ExecutorContext,
): Promise<ExecutorResult<Array<NginxTemplateAttributes & { id: number }>>> {
  const response = await request(
    ROUTES.nginxTemplates.list,
    ctx,
    { server_id: options.server_id },
    { schema: jsonApiListDocumentSchema(NginxTemplateAttributesSchema) },
  );

  return {
    data: unwrapListDocument(response),
  };
}
