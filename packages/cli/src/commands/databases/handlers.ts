import { listDatabases, getDatabase } from "@studiometa/forge-core";

import type { CommandContext } from "../../context.ts";

import { exitWithValidationError, runCommand } from "../../error-handler.ts";
import { resolveServerId } from "../../utils/resolve.ts";

export async function databasesList(ctx: CommandContext): Promise<void> {
  const server = String(ctx.options.server ?? "");

  if (!server) {
    exitWithValidationError(
      "server_id",
      "forge databases list --server <server_id>",
      ctx.formatter,
    );
  }

  await runCommand(async () => {
    const token = ctx.getToken();
    const execCtx = ctx.createExecutorContext(token);
    const server_id = await resolveServerId(server, execCtx);
    const result = await listDatabases({ server_id }, execCtx);
    ctx.formatter.outputList(
      result.data,
      ["id", "name", "status"],
      "No databases found.",
      (db) => `${String(db.id).padEnd(8)} ${db.name.padEnd(30)} ${db.status}`,
    );
  }, ctx.formatter);
}

export async function databasesGet(args: string[], ctx: CommandContext): Promise<void> {
  const [id] = args;
  const server = String(ctx.options.server ?? "");

  if (!id) {
    exitWithValidationError(
      "database_id",
      "forge databases get <database_id> --server <server_id>",
      ctx.formatter,
    );
  }

  if (!server) {
    exitWithValidationError(
      "server_id",
      "forge databases get <database_id> --server <server_id>",
      ctx.formatter,
    );
  }

  await runCommand(async () => {
    const token = ctx.getToken();
    const execCtx = ctx.createExecutorContext(token);
    const server_id = await resolveServerId(server, execCtx);
    const result = await getDatabase({ server_id, id }, execCtx);
    ctx.formatter.outputOne(result.data, ["id", "name", "status", "created_at"]);
  }, ctx.formatter);
}
