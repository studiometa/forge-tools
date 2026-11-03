import type { StorageProviderAttributes } from "@studiometa/forge-api";
import { StorageProviderAttributesSchema } from "@studiometa/forge-api";
import type { ExecutorContext, ExecutorResult } from "../../context.ts";
import { ROUTES } from "../../routes.ts";
import { listAllPages } from "../../utils/list-all-pages.ts";

import type { ListStorageProvidersOptions } from "./types.ts";

/**
 * List the storage providers of the organization, from every page.
 * Filter by provider type with `provider`.
 */
export async function listStorageProviders(
  options: ListStorageProvidersOptions,
  ctx: ExecutorContext,
): Promise<ExecutorResult<Array<StorageProviderAttributes & { id: number }>>> {
  return {
    data: await listAllPages(
      ROUTES.storageProviders.list,
      ctx,
      {},
      StorageProviderAttributesSchema,
      options.provider ? { "filter[provider]": options.provider } : {},
    ),
  };
}
