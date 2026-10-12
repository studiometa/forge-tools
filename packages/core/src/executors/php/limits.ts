import {
  jsonApiDocumentSchema,
  PhpMaxExecutionTimeAttributesSchema,
  PhpMaxUploadSizeAttributesSchema,
  unwrapDocument,
} from "@studiometa/forge-api";

import type { ExecutorContext, ExecutorResult } from "../../context.ts";
import { ROUTES, request } from "../../routes.ts";

import type {
  PhpServerOptions,
  UpdatePhpMaxExecutionTimeOptions,
  UpdatePhpMaxUploadSizeOptions,
} from "./types.ts";

/**
 * Get the PHP max upload size of a server, in megabytes.
 */
export async function getPhpMaxUploadSize(
  options: PhpServerOptions,
  ctx: ExecutorContext,
): Promise<ExecutorResult<string>> {
  const response = await request(
    ROUTES.php.getMaxUploadSize,
    ctx,
    { server_id: options.server_id },
    { schema: jsonApiDocumentSchema(PhpMaxUploadSizeAttributesSchema) },
  );

  return {
    data: String(unwrapDocument(response).max_upload_size),
  };
}

/**
 * Set the PHP max upload size of a server, in megabytes.
 */
export async function updatePhpMaxUploadSize(
  options: UpdatePhpMaxUploadSizeOptions,
  ctx: ExecutorContext,
): Promise<ExecutorResult<void>> {
  await request(
    ROUTES.php.updateMaxUploadSize,
    ctx,
    { server_id: options.server_id },
    { body: { max_upload_size: options.size } },
  );

  return {
    data: undefined,
  };
}

/**
 * Get the PHP max execution time of a server, in seconds.
 */
export async function getPhpMaxExecutionTime(
  options: PhpServerOptions,
  ctx: ExecutorContext,
): Promise<ExecutorResult<string>> {
  const response = await request(
    ROUTES.php.getMaxExecutionTime,
    ctx,
    { server_id: options.server_id },
    { schema: jsonApiDocumentSchema(PhpMaxExecutionTimeAttributesSchema) },
  );

  return {
    data: String(unwrapDocument(response).max_execution_time),
  };
}

/**
 * Set the PHP max execution time of a server, in seconds.
 */
export async function updatePhpMaxExecutionTime(
  options: UpdatePhpMaxExecutionTimeOptions,
  ctx: ExecutorContext,
): Promise<ExecutorResult<void>> {
  await request(
    ROUTES.php.updateMaxExecutionTime,
    ctx,
    { server_id: options.server_id },
    { body: { max_execution_time: options.seconds } },
  );

  return {
    data: undefined,
  };
}
