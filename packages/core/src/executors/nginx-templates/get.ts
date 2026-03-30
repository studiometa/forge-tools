import type { JsonApiDocument, NginxTemplateAttributes } from "@studiometa/forge-api";
import {
  unwrapDocument,
  jsonApiDocumentSchema,
  NginxTemplateAttributesSchema,
} from "@studiometa/forge-api";
import type { ExecutorContext, ExecutorResult } from "../../context.ts";
import { ROUTES, request } from "../../routes.ts";

import type { GetNginxTemplateOptions } from "./types.ts";

/**
 * Get a single Nginx template.
 */
export async function getNginxTemplate(
  options: GetNginxTemplateOptions,
  ctx: ExecutorContext,
): Promise<ExecutorResult<NginxTemplateAttributes & { id: number }>> {
  const response = await request<JsonApiDocument<NginxTemplateAttributes>>(
    ROUTES.nginxTemplates.get,
    ctx,
    { server_id: options.server_id, id: options.id },
    { schema: jsonApiDocumentSchema(NginxTemplateAttributesSchema) },
  );

  return {
    data: unwrapDocument(response),
  };
}
