import type { ForgeSshKey, SshKeyResponse } from "@studiometa/forge-api";
import type { ExecutorContext, ExecutorResult } from "../../context.ts";

import type { CreateSshKeyOptions } from "./types.ts";

export async function createSshKey(
  options: CreateSshKeyOptions,
  ctx: ExecutorContext,
): Promise<ExecutorResult<ForgeSshKey>> {
  const { server_id, ...data } = options;
  const response = await ctx.client.post<SshKeyResponse>(`/servers/${server_id}/keys`, data);
  const key = response.key;

  return {
    data: key,
    text: `SSH key created: ${key.name} (ID: ${key.id})`,
  };
}
