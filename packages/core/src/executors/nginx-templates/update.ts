import type { JsonApiDocument, NginxTemplateAttributes } from "@studiometa/forge-api";
import { unwrapDocument } from "@studiometa/forge-api";
import type { ExecutorContext, ExecutorResult } from "../../context.ts";
import { serverPath } from "../../utils/url-builder.ts";

import type { UpdateNginxTemplateOptions } from "./types.ts";

export async function updateNginxTemplate(
  options: UpdateNginxTemplateOptions,
  ctx: ExecutorContext,
): Promise<ExecutorResult<NginxTemplateAttributes & { id: number }>> {
  const { server_id, id, ...data } = options;
  const response = await ctx.client.put<JsonApiDocument<NginxTemplateAttributes>>(
    `${serverPath(server_id, ctx)}/nginx/templates/${id}`,
    data,
  );

  return {
    data: unwrapDocument(response),
  };
}
