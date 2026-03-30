import type { NginxTemplateAttributes } from "@studiometa/forge-api";
import {
  unwrapDocument,
  jsonApiDocumentSchema,
  NginxTemplateAttributesSchema,
} from "@studiometa/forge-api";
import type { ExecutorContext, ExecutorResult } from "../../context.ts";
import { ROUTES, request } from "../../routes.ts";

import type { CreateNginxTemplateOptions } from "./types.ts";

/**
 * Create a Nginx template.
 */
export async function createNginxTemplate(
  options: CreateNginxTemplateOptions,
  ctx: ExecutorContext,
): Promise<ExecutorResult<NginxTemplateAttributes & { id: number }>> {
  const { server_id, ...data } = options;
  const response = await request(
    ROUTES.nginxTemplates.create,
    ctx,
    { server_id },
    { body: data, schema: jsonApiDocumentSchema(NginxTemplateAttributesSchema) },
  );

  return {
    data: unwrapDocument(response),
  };
}
