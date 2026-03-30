import type { JsonApiDocument, NginxTemplateAttributes } from "@studiometa/forge-api";
import { unwrapDocument } from "@studiometa/forge-api";
import type { ExecutorContext, ExecutorResult } from "../../context.ts";
import { serverPath } from "../../utils/url-builder.ts";

import type { CreateNginxTemplateOptions } from "./types.ts";

export async function createNginxTemplate(
  options: CreateNginxTemplateOptions,
  ctx: ExecutorContext,
): Promise<ExecutorResult<NginxTemplateAttributes & { id: number }>> {
  const { server_id, ...data } = options;
  const response = await ctx.client.post<JsonApiDocument<NginxTemplateAttributes>>(
    `${serverPath(server_id, ctx)}/nginx/templates`,
    data,
  );

  return {
    data: unwrapDocument(response),
  };
}
