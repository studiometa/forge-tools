import type { CommandResponse, ForgeCommand } from "@studiometa/forge-api";
import type { ExecutorContext, ExecutorResult } from "../../context.ts";

/**
 * Get a specific command.
 */
export async function getCommand(
  options: { server_id: string; site_id: string; id: string },
  ctx: ExecutorContext,
): Promise<ExecutorResult<ForgeCommand>> {
  const response = await ctx.client.get<CommandResponse>(
    `/servers/${options.server_id}/sites/${options.site_id}/commands/${options.id}`,
  );
  const command = response.command;

  return {
    data: command,
  };
}
