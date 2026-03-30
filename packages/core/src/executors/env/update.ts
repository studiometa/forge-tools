import type { ExecutorContext, ExecutorResult } from "../../context.ts";
import { ROUTES, request } from "../../routes.ts";

import type { UpdateEnvOptions } from "./types.ts";

/**
 * Update environment variables for a site.
 */
export async function updateEnv(
  options: UpdateEnvOptions,
  ctx: ExecutorContext,
): Promise<ExecutorResult<void>> {
  await request(
    ROUTES.env.update,
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
