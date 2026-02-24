import type { CommandsResponse, ForgeCommand } from "@studiometa/forge-api";
import type { ExecutorContext, ExecutorResult } from "../../context.ts";

import type { ListCommandsOptions } from "./types.ts";

/**
 * List commands executed on a site.
 */
export async function listCommands(
  options: ListCommandsOptions,
  ctx: ExecutorContext,
): Promise<ExecutorResult<ForgeCommand[]>> {
  const response = await ctx.client.get<CommandsResponse>(
    `/servers/${options.server_id}/sites/${options.site_id}/commands`,
  );
  const commands = response.commands;

  return {
    data: commands,
  };
}
