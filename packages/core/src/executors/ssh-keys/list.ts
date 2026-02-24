import type { ForgeSshKey, SshKeysResponse } from "@studiometa/forge-api";
import type { ExecutorContext, ExecutorResult } from "../../context.ts";

import type { ListSshKeysOptions } from "./types.ts";

export async function listSshKeys(
  options: ListSshKeysOptions,
  ctx: ExecutorContext,
): Promise<ExecutorResult<ForgeSshKey[]>> {
  const response = await ctx.client.get<SshKeysResponse>(`/servers/${options.server_id}/keys`);
  const keys = response.keys;
  const lines = keys.map((k) => `• ${k.name} (ID: ${k.id}) — ${k.status}`);

  return {
    data: keys,
    text:
      keys.length > 0 ? `${keys.length} SSH key(s):\n${lines.join("\n")}` : "No SSH keys found.",
  };
}
