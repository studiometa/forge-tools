import type { JsonApiDocument, NginxTemplateAttributes } from "@studiometa/forge-api";
import { unwrapDocument } from "@studiometa/forge-api";
import type { ExecutorContext, ExecutorResult } from "../../context.ts";
import { serverPath } from "../../utils/url-builder.ts";

import type { GetNginxTemplateOptions } from "./types.ts";

export async function getNginxTemplate(
  options: GetNginxTemplateOptions,
  ctx: ExecutorContext,
): Promise<ExecutorResult<NginxTemplateAttributes & { id: number }>> {
  const response = await ctx.client.get<JsonApiDocument<NginxTemplateAttributes>>(
    `${serverPath(options.server_id, ctx)}/nginx/templates/${options.id}`,
  );

  return {
    data: unwrapDocument(response),
  };
}
