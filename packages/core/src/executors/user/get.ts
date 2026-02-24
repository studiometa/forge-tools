import type { ForgeUser, UserResponse } from "@studiometa/forge-api";
import type { ExecutorContext, ExecutorResult } from "../../context.ts";

/**
 * Get the currently authenticated user.
 */
export async function getUser(
  _options: Record<string, never>,
  ctx: ExecutorContext,
): Promise<ExecutorResult<ForgeUser>> {
  const response = await ctx.client.get<UserResponse>("/user");
  const user = response.user;

  return {
    data: user,
    text: [
      `User: ${user.name} (ID: ${user.id})`,
      `Email: ${user.email}`,
      `GitHub: ${user.connected_to_github ? "connected" : "not connected"}`,
      `GitLab: ${user.connected_to_gitlab ? "connected" : "not connected"}`,
      `2FA: ${user.two_factor_enabled ? "enabled" : "disabled"}`,
    ].join("\n"),
  };
}
