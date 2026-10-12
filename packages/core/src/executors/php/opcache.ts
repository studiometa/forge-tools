import {
  jsonApiDocumentSchema,
  PhpOpcacheAttributesSchema,
  unwrapDocument,
} from "@studiometa/forge-api";

import type { ExecutorContext, ExecutorResult } from "../../context.ts";
import { ROUTES, request } from "../../routes.ts";

import type { PhpServerOptions } from "./types.ts";

/**
 * Get whether PHP OPcache is enabled on a server.
 */
export async function getPhpOpcache(
  options: PhpServerOptions,
  ctx: ExecutorContext,
): Promise<ExecutorResult<boolean>> {
  const response = await request(
    ROUTES.php.getOpcache,
    ctx,
    { server_id: options.server_id },
    { schema: jsonApiDocumentSchema(PhpOpcacheAttributesSchema) },
  );

  return {
    data: unwrapDocument(response).opcache_enabled,
  };
}

/**
 * Enable PHP OPcache on a server.
 */
export async function enablePhpOpcache(
  options: PhpServerOptions,
  ctx: ExecutorContext,
): Promise<ExecutorResult<void>> {
  await request(ROUTES.php.enableOpcache, ctx, { server_id: options.server_id });

  return {
    data: undefined,
  };
}

/**
 * Disable PHP OPcache on a server.
 */
export async function disablePhpOpcache(
  options: PhpServerOptions,
  ctx: ExecutorContext,
): Promise<ExecutorResult<void>> {
  await request(ROUTES.php.disableOpcache, ctx, { server_id: options.server_id });

  return {
    data: undefined,
  };
}
