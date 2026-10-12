import type { PhpVersionAttributes } from "@studiometa/forge-api";
import {
  jsonApiDocumentSchema,
  jsonApiListDocumentSchema,
  PhpVersionAttributesSchema,
  unwrapDocument,
  unwrapListDocument,
} from "@studiometa/forge-api";

import type { ExecutorContext, ExecutorResult } from "../../context.ts";
import { ROUTES, request } from "../../routes.ts";

import type { GetPhpVersionOptions, PhpServerOptions } from "./types.ts";

/**
 * List the PHP versions installed on a server.
 */
export async function listPhpVersions(
  options: PhpServerOptions,
  ctx: ExecutorContext,
): Promise<ExecutorResult<Array<PhpVersionAttributes & { id: number }>>> {
  const response = await request(
    ROUTES.php.listVersions,
    ctx,
    { server_id: options.server_id },
    { schema: jsonApiListDocumentSchema(PhpVersionAttributesSchema) },
  );

  return {
    data: unwrapListDocument(response),
  };
}

/**
 * Resolve a PHP version to its ID on a server.
 *
 * A numeric value is an ID and is returned as is, without an API call.
 * Any other value is matched against the installed versions: "8.3",
 * "php8.3" (binary name) and "php83" all match version 8.3.
 */
export async function resolvePhpVersionId(
  server_id: string,
  version: string,
  ctx: ExecutorContext,
): Promise<string> {
  if (/^\d+$/.test(version)) {
    return version;
  }

  const { data: versions } = await listPhpVersions({ server_id }, ctx);
  const wanted = version.trim().toLowerCase();
  const match = versions.find((item) =>
    [item.version, item.binary_name, `php${item.version}`, `php${item.version.replace(".", "")}`]
      .map((name) => name.toLowerCase())
      .includes(wanted),
  );

  if (!match) {
    const installed = versions.map((item) => item.version).join(", ") || "none";
    throw new Error(
      `PHP version "${version}" is not installed on server ${server_id}. Installed: ${installed}.`,
    );
  }

  return String(match.id);
}

/**
 * Get one installed PHP version.
 */
export async function getPhpVersion(
  options: GetPhpVersionOptions,
  ctx: ExecutorContext,
): Promise<ExecutorResult<PhpVersionAttributes & { id: number }>> {
  const version_id = await resolvePhpVersionId(options.server_id, options.version, ctx);
  const response = await request(
    ROUTES.php.getVersion,
    ctx,
    { server_id: options.server_id, version_id },
    { schema: jsonApiDocumentSchema(PhpVersionAttributesSchema) },
  );

  return {
    data: unwrapDocument(response),
  };
}
