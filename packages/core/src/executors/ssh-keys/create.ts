import type { CreateSshKeyData, ForgeSshKey, SshKeyResponse } from "@studiometa/forge-api";
import type { ExecutorContext, ExecutorResult } from "../../context.ts";

export async function createSshKey(
  options: { server_id: string } & CreateSshKeyData,
  ctx: ExecutorContext,
): Promise<ExecutorResult<ForgeSshKey>> {
  const { server_id, ...data } = options;
  const response = await ctx.client.post<SshKeyResponse>(`/servers/${server_id}/keys`, data);
  const key = response.key;

  return {
    data: key,
  };
}
