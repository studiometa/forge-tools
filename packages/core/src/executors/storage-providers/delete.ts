import type { ExecutorContext, ExecutorResult } from "../../context.ts";
import { ROUTES, request } from "../../routes.ts";

import type { DeleteStorageProviderOptions } from "./types.ts";

/**
 * Delete a storage provider. Forge refuses when a backup configuration uses it.
 */
export async function deleteStorageProvider(
  options: DeleteStorageProviderOptions,
  ctx: ExecutorContext,
): Promise<ExecutorResult<void>> {
  await request(ROUTES.storageProviders.delete, ctx, { id: options.id });

  return {
    data: undefined,
  };
}
