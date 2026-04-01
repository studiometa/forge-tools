import type { ExecutorContext, ExecutorResult } from "../../context.ts";
import { ROUTES, request } from "../../routes.ts";

import type { DeleteNginxTemplateOptions } from "./types.ts";

/**
 * Delete a Nginx template.
 */
export async function deleteNginxTemplate(
  options: DeleteNginxTemplateOptions,
  ctx: ExecutorContext,
): Promise<ExecutorResult<void>> {
  await request(ROUTES.nginxTemplates.delete, ctx, {
    server_id: options.server_id,
    id: options.id,
  });

  return {
    data: undefined,
  };
}
