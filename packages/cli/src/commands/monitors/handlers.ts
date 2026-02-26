import { createMonitor, deleteMonitor, getMonitor, listMonitors } from "@studiometa/forge-core";

import type { CommandContext } from "../../context.ts";

import { exitWithValidationError, runCommand } from "../../error-handler.ts";
import { resolveServerId } from "../../utils/resolve.ts";

export async function monitorsList(ctx: CommandContext): Promise<void> {
  const server = String(ctx.options.server ?? "");

  if (!server) {
    exitWithValidationError(
      "server_id",
      "forge-cli monitors list --server <server_id>",
      ctx.formatter,
    );
  }

  await runCommand(async () => {
    const token = ctx.getToken();
    const execCtx = ctx.createExecutorContext(token);
    const server_id = await resolveServerId(server, execCtx);
    const result = await listMonitors({ server_id }, execCtx);
    ctx.formatter.outputList(
      result.data,
      ["id", "type", "operator", "threshold", "state"],
      "No monitors found.",
      (m) =>
        `${String(m.id).padEnd(8)} ${m.type.padEnd(20)} ${m.operator.padEnd(8)} ${String(m.threshold).padEnd(6)} ${m.state}`,
    );
  }, ctx.formatter);
}

export async function monitorsGet(args: string[], ctx: CommandContext): Promise<void> {
  const [id] = args;
  const server = String(ctx.options.server ?? "");

  if (!id) {
    exitWithValidationError(
      "monitor_id",
      "forge-cli monitors get <monitor_id> --server <server_id>",
      ctx.formatter,
    );
  }

  if (!server) {
    exitWithValidationError(
      "server_id",
      "forge-cli monitors get <monitor_id> --server <server_id>",
      ctx.formatter,
    );
  }

  await runCommand(async () => {
    const token = ctx.getToken();
    const execCtx = ctx.createExecutorContext(token);
    const server_id = await resolveServerId(server, execCtx);
    const result = await getMonitor({ server_id, id }, execCtx);
    ctx.formatter.outputOne(result.data, [
      "id", "type", "operator", "threshold", "minutes", "state", "state_changed_at",
    ]);
  }, ctx.formatter);
}

export async function monitorsCreate(ctx: CommandContext): Promise<void> {
  const server = String(ctx.options.server ?? "");
  const type = String(ctx.options.type ?? "");
  const operator = String(ctx.options.operator ?? "");
  const threshold = Number(ctx.options.threshold ?? 0);
  const minutes = Number(ctx.options.minutes ?? 0);

  if (!server) {
    exitWithValidationError(
      "server_id",
      "forge-cli monitors create --server <server_id> --type <type> --operator <operator> --threshold <threshold> --minutes <minutes>",
      ctx.formatter,
    );
  }

  if (!type) {
    exitWithValidationError(
      "type",
      "forge-cli monitors create --server <server_id> --type <type> --operator <operator> --threshold <threshold> --minutes <minutes>",
      ctx.formatter,
    );
  }

  if (!operator) {
    exitWithValidationError(
      "operator",
      "forge-cli monitors create --server <server_id> --type <type> --operator <operator> --threshold <threshold> --minutes <minutes>",
      ctx.formatter,
    );
  }

  await runCommand(async () => {
    const token = ctx.getToken();
    const execCtx = ctx.createExecutorContext(token);
    const server_id = await resolveServerId(server, execCtx);
    const result = await createMonitor({ server_id, type, operator, threshold, minutes }, execCtx);
    ctx.formatter.outputOne(result.data, [
      "id", "type", "operator", "threshold", "minutes", "state",
    ]);
  }, ctx.formatter);
}

export async function monitorsDelete(args: string[], ctx: CommandContext): Promise<void> {
  const [id] = args;
  const server = String(ctx.options.server ?? "");

  if (!id) {
    exitWithValidationError(
      "monitor_id",
      "forge-cli monitors delete <monitor_id> --server <server_id>",
      ctx.formatter,
    );
  }

  if (!server) {
    exitWithValidationError(
      "server_id",
      "forge-cli monitors delete <monitor_id> --server <server_id>",
      ctx.formatter,
    );
  }

  await runCommand(async () => {
    const token = ctx.getToken();
    const execCtx = ctx.createExecutorContext(token);
    const server_id = await resolveServerId(server, execCtx);
    await deleteMonitor({ server_id, id }, execCtx);
    ctx.formatter.success(`Monitor ${id} deleted.`);
  }, ctx.formatter);
}
