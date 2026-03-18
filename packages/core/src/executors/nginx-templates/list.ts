import type { JsonApiListDocument, NginxTemplateAttributes } from "@studiometa/forge-api";
import { unwrapListDocument } from "@studiometa/forge-api";
import type { ExecutorContext, ExecutorResult } from "../../context.ts";
import { serverPath } from "../../utils/url-builder.ts";

import type { ListNginxTemplatesOptions } from "./types.ts";

export async function listNginxTemplates(
  options: ListNginxTemplatesOptions,
  ctx: ExecutorContext,
): Promise<ExecutorResult<Array<NginxTemplateAttributes & { id: number }>>> {
  const response = await ctx.client.get<JsonApiListDocument<NginxTemplateAttributes>>(
    `${serverPath(options.server_id, ctx)}/nginx/templates`,
  );

  return {
    data: unwrapListDocument(response),
  };
}
