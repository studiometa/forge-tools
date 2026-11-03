import type { StorageProviderAttributes } from "@studiometa/forge-api";
import {
  unwrapDocument,
  jsonApiDocumentSchema,
  StorageProviderAttributesSchema,
} from "@studiometa/forge-api";
import type { ExecutorContext, ExecutorResult } from "../../context.ts";
import { ROUTES, request } from "../../routes.ts";

import type { CreateStorageProviderOptions } from "./types.ts";

/**
 * Create a storage provider, for example an S3-compatible bucket for database backups.
 */
export async function createStorageProvider(
  options: CreateStorageProviderOptions,
  ctx: ExecutorContext,
): Promise<ExecutorResult<StorageProviderAttributes & { id: number }>> {
  const response = await request(
    ROUTES.storageProviders.create,
    ctx,
    {},
    { body: options, schema: jsonApiDocumentSchema(StorageProviderAttributesSchema) },
  );

  return {
    data: unwrapDocument(response),
  };
}
