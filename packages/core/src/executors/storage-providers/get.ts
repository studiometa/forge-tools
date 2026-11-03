import type { StorageProviderAttributes } from "@studiometa/forge-api";
import {
  unwrapDocument,
  jsonApiDocumentSchema,
  StorageProviderAttributesSchema,
} from "@studiometa/forge-api";
import type { ExecutorContext, ExecutorResult } from "../../context.ts";
import { ROUTES, request } from "../../routes.ts";

import type { GetStorageProviderOptions } from "./types.ts";

/**
 * Get a single storage provider.
 */
export async function getStorageProvider(
  options: GetStorageProviderOptions,
  ctx: ExecutorContext,
): Promise<ExecutorResult<StorageProviderAttributes & { id: number }>> {
  const response = await request(
    ROUTES.storageProviders.get,
    ctx,
    { id: options.id },
    { schema: jsonApiDocumentSchema(StorageProviderAttributesSchema) },
  );

  return {
    data: unwrapDocument(response),
  };
}
