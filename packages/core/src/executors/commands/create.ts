import type { CommandResponse, ForgeCommand } from "@studiometa/forge-api";
import type { ExecutorContext, ExecutorResult } from "../../context.ts";

/**
 * Execute a command on a site.
 */
export async function createCommand(
  options: { server_id: string; site_id: string; command: string },
  ctx: ExecutorContext,
): Promise<ExecutorResult<ForgeCommand>> {
  const response = await ctx.client.post<CommandResponse>(
    `/servers/${options.server_id}/sites/${options.site_id}/commands`,
    { command: options.command },
  );
  const command = response.command;

  return {
    data: command,
    text: `Command executed: "${command.command}" (ID: ${command.id}) — ${command.status}`,
  };
}
