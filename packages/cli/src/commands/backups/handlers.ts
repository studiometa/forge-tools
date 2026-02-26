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
    exitWithValidationError(
      "server_id",
      "forge-cli backups list --server <server_id>",
      ctx.formatter,
    );
  }

  await runCommand(async () => {
    const token = ctx.getToken();
    const execCtx = ctx.createExecutorContext(token);
    const server_id = await resolveServerId(server, execCtx);
    const result = await listBackupConfigs({ server_id }, execCtx);
    ctx.formatter.output(result.data);
  }, ctx.formatter);
}

export async function backupsGet(args: string[], ctx: CommandContext): Promise<void> {
  const [id] = args;
  const server = String(ctx.options.server ?? "");

  if (!id) {
    exitWithValidationError(
      "backup_id",
      "forge-cli backups get <backup_id> --server <server_id>",
      ctx.formatter,
    );
  }

  if (!server) {
    exitWithValidationError(
      "server_id",
      "forge-cli backups get <backup_id> --server <server_id>",
      ctx.formatter,
    );
  }

  await runCommand(async () => {
    const token = ctx.getToken();
    const execCtx = ctx.createExecutorContext(token);
    const server_id = await resolveServerId(server, execCtx);
    const result = await getBackupConfig({ server_id, id }, execCtx);
    ctx.formatter.output(result.data);
  }, ctx.formatter);
}

export async function backupsCreate(ctx: CommandContext): Promise<void> {
  const server = String(ctx.options.server ?? "");
  const provider = String(ctx.options.provider ?? "");
  const frequency = String(ctx.options.frequency ?? "");
  const databasesRaw = ctx.options.databases;
  const databases = Array.isArray(databasesRaw)
    ? databasesRaw.map(Number)
    : databasesRaw
      ? [Number(databasesRaw)]
      : [];

  if (!server) {
    exitWithValidationError(
      "server_id",
      "forge-cli backups create --server <server_id> --provider <provider> --frequency <frequency>",
      ctx.formatter,
    );
  }

  if (!provider) {
    exitWithValidationError(
      "provider",
      "forge-cli backups create --server <server_id> --provider <provider> --frequency <frequency>",
      ctx.formatter,
    );
  }

  if (!frequency) {
    exitWithValidationError(
      "frequency",
      "forge-cli backups create --server <server_id> --provider <provider> --frequency <frequency>",
      ctx.formatter,
    );
  }

  await runCommand(async () => {
    const token = ctx.getToken();
    const execCtx = ctx.createExecutorContext(token);
    const server_id = await resolveServerId(server, execCtx);
    const result = await createBackupConfig(
      { server_id, provider, frequency, credentials: {}, databases },
      execCtx,
    );
    ctx.formatter.output(result.data);
  }, ctx.formatter);
}

export async function backupsDelete(args: string[], ctx: CommandContext): Promise<void> {
  const [id] = args;
  const server = String(ctx.options.server ?? "");

  if (!id) {
    exitWithValidationError(
      "backup_id",
      "forge-cli backups delete <backup_id> --server <server_id>",
      ctx.formatter,
    );
  }

  if (!server) {
    exitWithValidationError(
      "server_id",
      "forge-cli backups delete <backup_id> --server <server_id>",
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
