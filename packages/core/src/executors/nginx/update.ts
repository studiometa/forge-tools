import type { ExecutorContext, ExecutorResult } from "../../context.ts";
import { ROUTES, request } from "../../routes.ts";

import type { UpdateNginxConfigOptions } from "./types.ts";

/**
 * Update Nginx configuration for a site.
 */
export async function updateNginxConfig(
  options: UpdateNginxConfigOptions,
  ctx: ExecutorContext,
): Promise<ExecutorResult<void>> {
  await request(
    ROUTES.nginx.update,
    ctx,
    { server_id: options.server_id, site_id: options.site_id },
    {
      body: { content: options.content },
    },
  );

  return {
    data: undefined,
  };
}
