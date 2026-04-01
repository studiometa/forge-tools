import type { NginxTemplateAttributes } from "@studiometa/forge-api";
import {
  unwrapDocument,
  jsonApiDocumentSchema,
  NginxTemplateAttributesSchema,
} from "@studiometa/forge-api";
import type { ExecutorContext, ExecutorResult } from "../../context.ts";
import { ROUTES, request } from "../../routes.ts";

import type { UpdateNginxTemplateOptions } from "./types.ts";

/**
 * Update a Nginx template.
 */
export async function updateNginxTemplate(
  options: UpdateNginxTemplateOptions,
  ctx: ExecutorContext,
): Promise<ExecutorResult<NginxTemplateAttributes & { id: number }>> {
  const { server_id, id, ...data } = options;
  const response = await request(
    ROUTES.nginxTemplates.update,
    ctx,
    { server_id, id },
    { body: data, schema: jsonApiDocumentSchema(NginxTemplateAttributesSchema) },
  );

  return {
    data: unwrapDocument(response),
  };
}
