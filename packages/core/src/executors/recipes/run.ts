import type { ExecutorContext, ExecutorResult } from "../../context.ts";
import { ROUTES, request } from "../../routes.ts";

import type { RunRecipeOptions } from "./types.ts";

/**
 * Run a recipe on specified servers.
 */
export async function runRecipe(
  options: RunRecipeOptions,
  ctx: ExecutorContext,
): Promise<ExecutorResult<void>> {
  await request(
    ROUTES.recipes.run,
    ctx,
    { id: options.id },
    { body: { servers: options.servers } },
  );

  return {
    data: undefined,
  };
}
