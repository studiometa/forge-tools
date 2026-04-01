import { listDaemons, getDaemon, restartDaemon, updateDaemon } from "@studiometa/forge-core";

import type { CommandContext } from "../../context.ts";

import { exitWithValidationError, runCommand } from "../../error-handler.ts";
import { resolveServerId } from "../../utils/resolve.ts";

export async function daemonsList(ctx: CommandContext): Promise<void> {
  const server = String(ctx.options.server ?? "");

  if (!server) {
    exitWithValidationError("server_id", "forge daemons list --server <server_id>", ctx.formatter);
  }

  await runCommand(async () => {
    const token = ctx.getToken();
    const execCtx = ctx.createExecutorContext(token);
    const server_id = await resolveServerId(server, execCtx);
    const result = await listDaemons({ server_id }, execCtx);
    ctx.formatter.outputList(
      result.data,
      ["id", "command", "user", "status"],
      "No daemons found.",
      (d) => `${String(d.id).padEnd(8)} ${d.command.padEnd(50)} ${d.user.padEnd(16)} ${d.status}`,
    );
  }, ctx.formatter);
}

export async function daemonsGet(args: string[], ctx: CommandContext): Promise<void> {
  const [id] = args;
  const server = String(ctx.options.server ?? "");

  if (!id) {
    exitWithValidationError(
      "daemon_id",
      "forge daemons get <daemon_id> --server <server_id>",
      ctx.formatter,
    );
  }

  if (!server) {
    exitWithValidationError(
      "server_id",
      "forge daemons get <daemon_id> --server <server_id>",
      ctx.formatter,
    );
  }

  await runCommand(async () => {
    const token = ctx.getToken();
    const execCtx = ctx.createExecutorContext(token);
    const server_id = await resolveServerId(server, execCtx);
    const result = await getDaemon({ server_id, id }, execCtx);
    ctx.formatter.outputOne(result.data, [
      "id",
      "command",
      "user",
      "directory",
      "processes",
      "status",
      "created_at",
    ]);
  }, ctx.formatter);
}

export async function daemonsUpdate(args: string[], ctx: CommandContext): Promise<void> {
  const [id] = args;
  const server = String(ctx.options.server ?? "");
  const name = String(ctx.options.name ?? "");

  if (!id) {
    exitWithValidationError(
      "daemon_id",
      "forge daemons update <daemon_id> --server <server_id> --name <name>",
      ctx.formatter,
    );
  }

  if (!server) {
    exitWithValidationError(
      "server_id",
      "forge daemons update <daemon_id> --server <server_id> --name <name>",
      ctx.formatter,
    );
  }

  if (!name) {
    exitWithValidationError(
      "name",
      "forge daemons update <daemon_id> --server <server_id> --name <name>",
      ctx.formatter,
    );
  }

  await runCommand(async () => {
    const token = ctx.getToken();
    const execCtx = ctx.createExecutorContext(token);
    const server_id = await resolveServerId(server, execCtx);
    const options: Record<string, string> = { server_id, id, name };
    if (ctx.options.config) {
      options.config = String(ctx.options.config);
    }
    const result = await updateDaemon(options as never, execCtx);
    ctx.formatter.outputOne(result.data, [
      "id",
      "command",
      "user",
      "directory",
      "processes",
      "status",
      "created_at",
    ]);
  }, ctx.formatter);
}

export async function daemonsRestart(args: string[], ctx: CommandContext): Promise<void> {
  const [id] = args;
  const server = String(ctx.options.server ?? "");

  if (!id) {
    exitWithValidationError(
      "daemon_id",
      "forge daemons restart <daemon_id> --server <server_id>",
      ctx.formatter,
    );
  }

  if (!server) {
    exitWithValidationError(
      "server_id",
      "forge daemons restart <daemon_id> --server <server_id>",
      ctx.formatter,
    );
  }

  await runCommand(async () => {
    const token = ctx.getToken();
    const execCtx = ctx.createExecutorContext(token);
    const server_id = await resolveServerId(server, execCtx);
    await restartDaemon({ server_id, id }, execCtx);
    ctx.formatter.success(`Daemon ${id} restarted.`);
  }, ctx.formatter);
}
