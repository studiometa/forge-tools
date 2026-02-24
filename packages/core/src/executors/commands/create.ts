import type { CommandResponse, ForgeCommand } from "@studiometa/forge-api";
import type { ExecutorContext, ExecutorResult } from "../../context.ts";

import type { CreateCommandOptions } from "./types.ts";

/**
 * Execute a command on a site.
 */
export async function createCommand(
  options: CreateCommandOptions,
  ctx: ExecutorContext,
): Promise<ExecutorResult<ForgeCommand>> {
  const response = await ctx.client.post<CommandResponse>(
    `/servers/${options.server_id}/sites/${options.site_id}/commands`,
    { command: options.command },
  );
  const command = response.command;

  return {
    data: command,
  };
}
