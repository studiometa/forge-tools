import type { ExecutorContext, ExecutorResult } from "../../context.ts";
import { serverPath } from "../../utils/url-builder.ts";

import type { CreateSshKeyOptions } from "./types.ts";

export async function createSshKey(
  options: CreateSshKeyOptions,
  ctx: ExecutorContext,
): Promise<ExecutorResult<void>> {
  const { server_id, ...data } = options;
  await ctx.client.post(`${serverPath(server_id, ctx)}/ssh-keys`, data);

  return { data: undefined };
}
