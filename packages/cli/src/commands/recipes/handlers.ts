import { listRecipes, getRecipe, runRecipe } from "@studiometa/forge-core";

import type { CommandContext } from "../../context.ts";

import { exitWithValidationError, runCommand } from "../../error-handler.ts";

export async function recipesList(ctx: CommandContext): Promise<void> {
  await runCommand(async () => {
    const token = ctx.getToken();
    const execCtx = ctx.createExecutorContext(token);
    const result = await listRecipes({}, execCtx);
    ctx.formatter.output(result.data);
  }, ctx.formatter);
}

export async function recipesGet(args: string[], ctx: CommandContext): Promise<void> {
  const [id] = args;

  if (!id) {
    exitWithValidationError("id", "forge-cli recipes get <recipe_id>", ctx.formatter);
  }

  await runCommand(async () => {
    const token = ctx.getToken();
    const execCtx = ctx.createExecutorContext(token);
    const result = await getRecipe({ id }, execCtx);
    ctx.formatter.output(result.data);
  }, ctx.formatter);
}

export async function recipesRun(args: string[], ctx: CommandContext): Promise<void> {
  const [id] = args;
  const serversRaw = String(ctx.options.servers ?? "");

  if (!id) {
    exitWithValidationError(
      "id",
      "forge-cli recipes run <recipe_id> --servers <ids>",
      ctx.formatter,
    );
  }

  if (!serversRaw) {
    exitWithValidationError(
      "servers",
      "forge-cli recipes run <recipe_id> --servers <server_id1,server_id2,...>",
      ctx.formatter,
    );
  }

  const servers = serversRaw
    .split(",")
    .map((s) => Number(s.trim()))
    .filter((n) => !isNaN(n));

  await runCommand(async () => {
    const token = ctx.getToken();
    const execCtx = ctx.createExecutorContext(token);
    await runRecipe({ id, servers }, execCtx);
    ctx.formatter.success(`Recipe ${id} dispatched to ${servers.length} server(s).`);
  }, ctx.formatter);
}
