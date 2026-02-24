import type { CommandResponse, ForgeCommand } from "@studiometa/forge-api";
import type { ExecutorContext, ExecutorResult } from "../../context.ts";

import type { GetCommandOptions } from "./types.ts";

/**
 * Get a specific command.
 */
export async function getCommand(
  options: GetCommandOptions,
  ctx: ExecutorContext,
): Promise<ExecutorResult<ForgeCommand>> {
  const response = await ctx.client.get<CommandResponse>(
    `/servers/${options.server_id}/sites/${options.site_id}/commands/${options.id}`,
  );
  const command = response.command;

  return {
    data: command,
    text: [
      `Command #${command.id}`,
      `Command: ${command.command}`,
      `Status: ${command.status}`,
      `User: ${command.user_name}`,
      `Created: ${command.created_at}`,
    ].join("\n"),
  };
}
