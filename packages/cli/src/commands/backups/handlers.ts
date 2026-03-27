import {
  createBackupConfig,
  deleteBackupConfig,
  getBackupConfig,
  listBackupConfigs,
} from "@studiometa/forge-core";

import type { CommandContext } from "../../context.ts";

import { exitWithValidationError, runCommand } from "../../error-handler.ts";
import { resolveServerId } from "../../utils/resolve.ts";

export async function backupsList(ctx: CommandContext): Promise<void> {
  const server = String(ctx.options.server ?? "");

  if (!server) {
    exitWithValidationError("server_id", "forge backups list --server <server_id>", ctx.formatter);
  }

  await runCommand(async () => {
    const token = ctx.getToken();
    const execCtx = ctx.createExecutorContext(token);
    const server_id = await resolveServerId(server, execCtx);
    const result = await listBackupConfigs({ server_id }, execCtx);
    ctx.formatter.outputList(
      result.data,
      ["id", "name", "schedule", "status"],
      "No backup configurations found.",
      (b) => `${String(b.id).padEnd(8)} ${b.name.padEnd(20)} ${b.schedule.padEnd(12)} ${b.status}`,
    );
  }, ctx.formatter);
}

export async function backupsGet(args: string[], ctx: CommandContext): Promise<void> {
  const [id] = args;
  const server = String(ctx.options.server ?? "");

  if (!id) {
    exitWithValidationError(
      "backup_id",
      "forge backups get <backup_id> --server <server_id>",
      ctx.formatter,
    );
  }

  if (!server) {
    exitWithValidationError(
      "server_id",
      "forge backups get <backup_id> --server <server_id>",
      ctx.formatter,
    );
  }

  await runCommand(async () => {
    const token = ctx.getToken();
    const execCtx = ctx.createExecutorContext(token);
    const server_id = await resolveServerId(server, execCtx);
    const result = await getBackupConfig({ server_id, id }, execCtx);
    ctx.formatter.outputOne(result.data, [
      "id",
      "name",
      "provider",
      "schedule",
      "displayable_schedule",
      "retention",
      "status",
      "next_run_time",
    ]);
  }, ctx.formatter);
}

export async function backupsCreate(ctx: CommandContext): Promise<void> {
  const server = String(ctx.options.server ?? "");
  const storageProviderId = Number(ctx.options.provider ?? 0);
  const frequency = String(ctx.options.frequency ?? "");
  const databaseIdsRaw = ctx.options.databases;
  const database_ids = Array.isArray(databaseIdsRaw)
    ? databaseIdsRaw.map(Number)
    : databaseIdsRaw
      ? [Number(databaseIdsRaw)]
      : [];

  if (!server) {
    exitWithValidationError(
      "server_id",
      "forge backups create --server <server_id> --provider <provider> --frequency <frequency>",
      ctx.formatter,
    );
  }

  if (!storageProviderId) {
    exitWithValidationError(
      "provider",
      "forge backups create --server <server_id> --provider <provider> --frequency <frequency>",
      ctx.formatter,
    );
  }

  if (!frequency) {
    exitWithValidationError(
      "frequency",
      "forge backups create --server <server_id> --provider <provider> --frequency <frequency>",
      ctx.formatter,
    );
  }

  await runCommand(async () => {
    const token = ctx.getToken();
    const execCtx = ctx.createExecutorContext(token);
    const server_id = await resolveServerId(server, execCtx);
    await createBackupConfig(
      { server_id, storage_provider_id: storageProviderId, frequency, retention: 5, database_ids },
      execCtx,
    );
    ctx.formatter.success("Backup configuration created.");
  }, ctx.formatter);
}

export async function backupsDelete(args: string[], ctx: CommandContext): Promise<void> {
  const [id] = args;
  const server = String(ctx.options.server ?? "");

  if (!id) {
    exitWithValidationError(
      "backup_id",
      "forge backups delete <backup_id> --server <server_id>",
      ctx.formatter,
    );
  }

  if (!server) {
    exitWithValidationError(
      "server_id",
      "forge backups delete <backup_id> --server <server_id>",
      ctx.formatter,
    );
  }

  await runCommand(async () => {
    const token = ctx.getToken();
    const execCtx = ctx.createExecutorContext(token);
    const server_id = await resolveServerId(server, execCtx);
    await deleteBackupConfig({ server_id, id }, execCtx);
    ctx.formatter.success(`Backup configuration ${id} deleted.`);
  }, ctx.formatter);
}
