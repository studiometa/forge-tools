import type { ExecutorContext, ExecutorResult } from "../../context.ts";

import type { DeleteNginxTemplateOptions } from "./types.ts";

export async function deleteNginxTemplate(
  options: DeleteNginxTemplateOptions,
  ctx: ExecutorContext,
): Promise<ExecutorResult<void>> {
  await ctx.client.delete(`/servers/${options.server_id}/nginx/templates/${options.id}`);

  return {
    data: undefined,
  };
}
