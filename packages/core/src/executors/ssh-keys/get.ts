import type { JsonApiDocument, SshKeyAttributes } from "@studiometa/forge-api";
import {
  unwrapDocument,
  jsonApiDocumentSchema,
  SshKeyAttributesSchema,
} from "@studiometa/forge-api";
import type { ExecutorContext, ExecutorResult } from "../../context.ts";
import { ROUTES, request } from "../../routes.ts";

import type { GetSshKeyOptions } from "./types.ts";

/**
 * Get a single SSH key.
 */
export async function getSshKey(
  options: GetSshKeyOptions,
  ctx: ExecutorContext,
): Promise<ExecutorResult<SshKeyAttributes & { id: number }>> {
  const response = await request<JsonApiDocument<SshKeyAttributes>>(
    ROUTES.sshKeys.get,
    ctx,
    { server_id: options.server_id, id: options.id },
    { schema: jsonApiDocumentSchema(SshKeyAttributesSchema) },
  );

  return {
    data: unwrapDocument(response),
  };
}
