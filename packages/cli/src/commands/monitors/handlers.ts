import { createMonitor, deleteMonitor, getMonitor, listMonitors } from "@studiometa/forge-core";

import type { CommandContext } from "../../context.ts";

import { exitWithValidationError, runCommand } from "../../error-handler.ts";
import { resolveServerId } from "../../utils/resolve.ts";

export async function monitorsList(ctx: CommandContext): Promise<void> {
  const server = String(ctx.options.server ?? "");

  if (!server) {
    exitWithValidationError("server_id", "forge monitors list --server <server_id>", ctx.formatter);
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
      "forge monitors get <monitor_id> --server <server_id>",
      ctx.formatter,
    );
  }

  if (!server) {
    exitWithValidationError(
      "server_id",
      "forge monitors get <monitor_id> --server <server_id>",
      ctx.formatter,
    );
  }

  await runCommand(async () => {
    const token = ctx.getToken();
    const execCtx = ctx.createExecutorContext(token);
    const server_id = await resolveServerId(server, execCtx);
    const result = await getMonitor({ server_id, id }, execCtx);
    ctx.formatter.outputOne(result.data, [
      "id",
      "type",
      "operator",
      "threshold",
      "minutes",
      "state",
      "state_changed_at",
    ]);
  }, ctx.formatter);
}

const MONITOR_TYPES = new Set(["cpu_load", "disk", "free_memory", "used_memory"]);

const CREATE_USAGE =
  "forge monitors create --server <server_id> --type cpu_load|disk|free_memory|used_memory --operator gte|lte --threshold <threshold> --notify <email> [--minutes <minutes>]";

export async function monitorsCreate(ctx: CommandContext): Promise<void> {
  const server = String(ctx.options.server ?? "");
  const type = String(ctx.options.type ?? "");
  const operator = String(ctx.options.operator ?? "");
  const threshold = Number(ctx.options.threshold ?? 0);
  const notify = String(ctx.options.notify ?? "");
  const minutes = ctx.options.minutes === undefined ? undefined : Number(ctx.options.minutes);

  if (!server) {
    exitWithValidationError("server_id", CREATE_USAGE, ctx.formatter);
  }

  if (!type) {
    exitWithValidationError("type", CREATE_USAGE, ctx.formatter);
  }

  if (!operator) {
    exitWithValidationError("operator", CREATE_USAGE, ctx.formatter);
  }

  if (!MONITOR_TYPES.has(type)) {
    exitWithValidationError("type", CREATE_USAGE, ctx.formatter);
  }

  if (!["gte", "lte"].includes(operator)) {
    exitWithValidationError("operator", CREATE_USAGE, ctx.formatter);
  }

  // Forge requires the email address to notify.
  if (!notify) {
    exitWithValidationError("notify", CREATE_USAGE, ctx.formatter);
  }

  await runCommand(async () => {
    const token = ctx.getToken();
    const execCtx = ctx.createExecutorContext(token);
    const server_id = await resolveServerId(server, execCtx);
    const result = await createMonitor(
      {
        server_id,
        type,
        operator,
        threshold,
        notify,
        ...(minutes === undefined ? {} : { minutes }),
      },
      execCtx,
    );
    ctx.formatter.outputOne(result.data, [
      "id",
      "type",
      "operator",
      "threshold",
      "minutes",
      "state",
    ]);
  }, ctx.formatter);
}

export async function monitorsDelete(args: string[], ctx: CommandContext): Promise<void> {
  const [id] = args;
  const server = String(ctx.options.server ?? "");

  if (!id) {
    exitWithValidationError(
      "monitor_id",
      "forge monitors delete <monitor_id> --server <server_id>",
      ctx.formatter,
    );
  }

  if (!server) {
    exitWithValidationError(
      "server_id",
      "forge monitors delete <monitor_id> --server <server_id>",
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
