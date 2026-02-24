import { listDaemons, getDaemon, restartDaemon } from "@studiometa/forge-core";

import type { CommandContext } from "../../context.ts";

import { exitWithValidationError, runCommand } from "../../error-handler.ts";

export async function daemonsList(ctx: CommandContext): Promise<void> {
  const server_id = String(ctx.options.server ?? "");

  if (!server_id) {
    exitWithValidationError(
      "server_id",
      "forge-cli daemons list --server <server_id>",
      ctx.formatter,
    );
  }

  await runCommand(async () => {
    const token = ctx.getToken();
    const execCtx = ctx.createExecutorContext(token);
    const result = await listDaemons({ server_id }, execCtx);
    ctx.formatter.output(result.data);
  }, ctx.formatter);
}

export async function daemonsGet(args: string[], ctx: CommandContext): Promise<void> {
  const [id] = args;
  const server_id = String(ctx.options.server ?? "");

  if (!id) {
    exitWithValidationError(
      "daemon_id",
      "forge-cli daemons get <daemon_id> --server <server_id>",
      ctx.formatter,
    );
  }

  if (!server_id) {
    exitWithValidationError(
      "server_id",
      "forge-cli daemons get <daemon_id> --server <server_id>",
      ctx.formatter,
    );
  }

  await runCommand(async () => {
    const token = ctx.getToken();
    const execCtx = ctx.createExecutorContext(token);
    const result = await getDaemon({ server_id, id }, execCtx);
    ctx.formatter.output(result.data);
  }, ctx.formatter);
}

export async function daemonsRestart(args: string[], ctx: CommandContext): Promise<void> {
  const [id] = args;
  const server_id = String(ctx.options.server ?? "");

  if (!id) {
    exitWithValidationError(
      "daemon_id",
      "forge-cli daemons restart <daemon_id> --server <server_id>",
      ctx.formatter,
    );
  }

  if (!server_id) {
    exitWithValidationError(
      "server_id",
      "forge-cli daemons restart <daemon_id> --server <server_id>",
      ctx.formatter,
    );
  }

  await runCommand(async () => {
    const token = ctx.getToken();
    const execCtx = ctx.createExecutorContext(token);
    await restartDaemon({ server_id, id }, execCtx);
    ctx.formatter.success(`Daemon ${id} restarted.`);
  }, ctx.formatter);
}
