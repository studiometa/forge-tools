import type { ForgeSshKey, SshKeysResponse } from "@studiometa/forge-api";
import type { ExecutorContext, ExecutorResult } from "../../context.ts";

export async function listSshKeys(
  options: { server_id: string },
  ctx: ExecutorContext,
): Promise<ExecutorResult<ForgeSshKey[]>> {
  const response = await ctx.client.get<SshKeysResponse>(`/servers/${options.server_id}/keys`);
  const keys = response.keys;
  return {
    data: keys,
  };
}
