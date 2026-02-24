import type { ForgeSshKey, SshKeysResponse } from "@studiometa/forge-api";
import type { ExecutorContext, ExecutorResult } from "../../context.ts";

import type { ListSshKeysOptions } from "./types.ts";

export async function listSshKeys(
  options: ListSshKeysOptions,
  ctx: ExecutorContext,
): Promise<ExecutorResult<ForgeSshKey[]>> {
  const response = await ctx.client.get<SshKeysResponse>(`/servers/${options.server_id}/keys`);
  const keys = response.keys;
  return {
    data: keys,
  };
}
