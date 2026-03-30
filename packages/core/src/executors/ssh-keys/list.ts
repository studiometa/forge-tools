import type { JsonApiListDocument, SshKeyAttributes } from "@studiometa/forge-api";
import { unwrapListDocument } from "@studiometa/forge-api";
import type { ExecutorContext, ExecutorResult } from "../../context.ts";
import { serverPath } from "../../utils/url-builder.ts";

import type { ListSshKeysOptions } from "./types.ts";

export async function listSshKeys(
  options: ListSshKeysOptions,
  ctx: ExecutorContext,
): Promise<ExecutorResult<Array<SshKeyAttributes & { id: number }>>> {
  const response = await ctx.client.get<JsonApiListDocument<SshKeyAttributes>>(
    `${serverPath(options.server_id, ctx)}/ssh-keys`,
  );

  return {
    data: unwrapListDocument(response),
  };
}
