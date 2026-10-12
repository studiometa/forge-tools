import {
  jsonApiDocumentSchema,
  PhpConfigAttributesSchema,
  unwrapDocument,
} from "@studiometa/forge-api";

import type { ExecutorContext, ExecutorResult } from "../../context.ts";
import { ROUTES, request } from "../../routes.ts";

import { PHP_CONFIG_TYPES } from "./types.ts";
import type { GetPhpConfigOptions, UpdatePhpConfigOptions } from "./types.ts";
import { resolvePhpVersionId } from "./versions.ts";

/**
 * Throw when the configuration type is not one of cli, fpm or pool.
 */
function assertConfigType(type: string): void {
  if (!(PHP_CONFIG_TYPES as readonly string[]).includes(type)) {
    throw new Error(
      `Invalid PHP config type "${type}". Valid types: ${PHP_CONFIG_TYPES.join(", ")}.`,
    );
  }
}

/**
 * Get a PHP configuration file (cli, fpm or pool) for an installed version.
 */
export async function getPhpConfig(
  options: GetPhpConfigOptions,
  ctx: ExecutorContext,
): Promise<ExecutorResult<string>> {
  assertConfigType(options.type);
  const version_id = await resolvePhpVersionId(options.server_id, options.version, ctx);
  const response = await request(
    ROUTES.php.getConfig,
    ctx,
    { server_id: options.server_id, version_id, type: options.type },
    {
      schema: jsonApiDocumentSchema(PhpConfigAttributesSchema),
      ...(options.user ? { query: { user: options.user } } : {}),
    },
  );

  return {
    data: unwrapDocument(response).configuration,
  };
}

/**
 * Replace a PHP configuration file (cli, fpm or pool) for an installed version.
 */
export async function updatePhpConfig(
  options: UpdatePhpConfigOptions,
  ctx: ExecutorContext,
): Promise<ExecutorResult<void>> {
  assertConfigType(options.type);
  const version_id = await resolvePhpVersionId(options.server_id, options.version, ctx);
  await request(
    ROUTES.php.updateConfig,
    ctx,
    { server_id: options.server_id, version_id, type: options.type },
    {
      body: {
        config: options.content,
        ...(options.user ? { user: options.user } : {}),
      },
    },
  );

  return {
    data: undefined,
  };
}
