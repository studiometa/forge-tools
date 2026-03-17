import type { JsonApiDocument, SshKeyAttributes } from "@studiometa/forge-api";
import { unwrapDocument } from "@studiometa/forge-api";
import type { ExecutorContext, ExecutorResult } from "../../context.ts";
import { serverPath } from "../../utils/url-builder.ts";

import type { CreateSshKeyOptions } from "./types.ts";

export async function createSshKey(
  options: CreateSshKeyOptions,
  ctx: ExecutorContext,
): Promise<ExecutorResult<SshKeyAttributes & { id: number }>> {
  const { server_id, ...data } = options;
  const response = await ctx.client.post<JsonApiDocument<SshKeyAttributes>>(
    `${serverPath(server_id, ctx)}/ssh-keys`,
    data,
  );

  return {
    data: unwrapDocument(response),
  };
}
