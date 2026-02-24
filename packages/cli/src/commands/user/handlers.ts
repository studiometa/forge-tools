import { getUser } from "@studiometa/forge-core";

import type { CommandContext } from "../../context.ts";

import { runCommand } from "../../error-handler.ts";

export async function userGet(ctx: CommandContext): Promise<void> {
  await runCommand(async () => {
    const token = ctx.getToken();
    const execCtx = ctx.createExecutorContext(token);
    const result = await getUser({}, execCtx);
    ctx.formatter.output(result.data);
  }, ctx.formatter);
}
