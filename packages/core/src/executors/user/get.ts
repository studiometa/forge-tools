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
  };
}
