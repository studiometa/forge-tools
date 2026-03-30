import type { JsonApiListDocument, SshKeyAttributes } from "@studiometa/forge-api";
import {
  unwrapListDocument,
  jsonApiListDocumentSchema,
  SshKeyAttributesSchema,
} from "@studiometa/forge-api";
import type { ExecutorContext, ExecutorResult } from "../../context.ts";
import { ROUTES, request } from "../../routes.ts";

import type { ListSshKeysOptions } from "./types.ts";

/**
 * List SSH keys on a server.
 */
export async function listSshKeys(
  options: ListSshKeysOptions,
  ctx: ExecutorContext,
): Promise<ExecutorResult<Array<SshKeyAttributes & { id: number }>>> {
  const response = await request<JsonApiListDocument<SshKeyAttributes>>(
    ROUTES.sshKeys.list,
    ctx,
    { server_id: options.server_id },
    { schema: jsonApiListDocumentSchema(SshKeyAttributesSchema) },
  );

  return {
    data: unwrapListDocument(response),
  };
}
