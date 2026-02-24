import type { ForgeSshKey, SshKeyResponse } from "@studiometa/forge-api";
import type { ExecutorContext, ExecutorResult } from "../../context.ts";

import type { GetSshKeyOptions } from "./types.ts";

export async function getSshKey(
  options: GetSshKeyOptions,
  ctx: ExecutorContext,
): Promise<ExecutorResult<ForgeSshKey>> {
  const response = await ctx.client.get<SshKeyResponse>(
    `/servers/${options.server_id}/keys/${options.id}`,
  );
  const key = response.key;

  return {
    data: key,
    text: `SSH Key: ${key.name} (ID: ${key.id})\nStatus: ${key.status}\nCreated: ${key.created_at}`,
  };
}
