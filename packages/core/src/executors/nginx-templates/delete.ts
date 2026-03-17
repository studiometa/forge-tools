import type { ExecutorContext, ExecutorResult } from "../../context.ts";
import { serverPath } from "../../utils/url-builder.ts";

import type { DeleteNginxTemplateOptions } from "./types.ts";

export async function deleteNginxTemplate(
  options: DeleteNginxTemplateOptions,
  ctx: ExecutorContext,
): Promise<ExecutorResult<void>> {
  await ctx.client.delete(`${serverPath(options.server_id, ctx)}/nginx/templates/${options.id}`);

  return {
    data: undefined,
  };
}
