import type { JsonApiDocument, SshKeyAttributes } from "@studiometa/forge-api";
import { unwrapDocument } from "@studiometa/forge-api";
import type { ExecutorContext, ExecutorResult } from "../../context.ts";
import { serverPath } from "../../utils/url-builder.ts";

import type { GetSshKeyOptions } from "./types.ts";

export async function getSshKey(
  options: GetSshKeyOptions,
  ctx: ExecutorContext,
): Promise<ExecutorResult<SshKeyAttributes & { id: number }>> {
  const response = await ctx.client.get<JsonApiDocument<SshKeyAttributes>>(
    `${serverPath(options.server_id, ctx)}/ssh-keys/${options.id}`,
  );

  return {
    data: unwrapDocument(response),
  };
}
