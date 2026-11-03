import {
  createBackupConfig,
  deleteBackupConfig,
  getBackupConfig,
  listBackupConfigs,
  updateBackupConfig,
} from "@studiometa/forge-core";

import type { CommandContext } from "../../context.ts";

import { exitWithValidationError, runCommand } from "../../error-handler.ts";
import { resolveServerId } from "../../utils/resolve.ts";
import {
  checkFrequency,
  listValues,
  optionalBackupFields,
  parseRetention,
  resolveDatabaseIds,
  resolveStorageProviderId,
} from "./options.ts";

/** Retention when --retention is not given: Forge requires a value. */
const DEFAULT_RETENTION = 5;

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
      "storage_provider_id",
      "provider",
      "bucket",
      "directory",
      "schedule",
      "displayable_schedule",
      "retention",
      "status",
      "next_run_time",
    ]);
  }, ctx.formatter);
}

const CREATE_USAGE =
  "forge backups create --server <server> --storage-provider <id|name> --frequency <hourly|daily|weekly|custom> --databases <ids|names> [--retention <n>]";

export async function backupsCreate(ctx: CommandContext): Promise<void> {
  const server = String(ctx.options.server ?? "");
  const storageProvider = ctx.options["storage-provider"];
  const frequency = ctx.options.frequency;
  const databases = listValues(ctx.options.databases);

  if (!server) {
    exitWithValidationError("server_id", CREATE_USAGE, ctx.formatter);
  }

  if (typeof storageProvider !== "string" || !storageProvider) {
    exitWithValidationError("storage-provider", CREATE_USAGE, ctx.formatter);
  }

  if (typeof frequency !== "string" || !frequency) {
    exitWithValidationError("frequency", CREATE_USAGE, ctx.formatter);
  }

  if (databases.length === 0) {
    exitWithValidationError("databases", CREATE_USAGE, ctx.formatter);
  }

  await runCommand(async () => {
    checkFrequency(frequency);
    const retention =
      ctx.options.retention === undefined
        ? DEFAULT_RETENTION
        : parseRetention(ctx.options.retention);
    const token = ctx.getToken();
    const execCtx = ctx.createExecutorContext(token);
    const server_id = await resolveServerId(server, execCtx);
    const storage_provider_id = await resolveStorageProviderId(storageProvider, execCtx);
    const database_ids = await resolveDatabaseIds(databases, server_id, execCtx);
    await createBackupConfig(
      {
        server_id,
        storage_provider_id,
        frequency,
        retention,
        database_ids,
        ...(ctx.options["include-new-databases"] === true ? { include_new_databases: true } : {}),
        ...optionalBackupFields(ctx.options),
      },
      execCtx,
    );
    ctx.formatter.success("Backup configuration created.");
  }, ctx.formatter);
}

const UPDATE_USAGE =
  "forge backups update <backup_id> --server <server> --storage-provider <id|name> --frequency <hourly|daily|weekly|custom> --retention <n> --databases <ids|names>";

export async function backupsUpdate(args: string[], ctx: CommandContext): Promise<void> {
  const [id] = args;
  const server = String(ctx.options.server ?? "");
  const storageProvider = ctx.options["storage-provider"];
  const frequency = ctx.options.frequency;
  const databases = listValues(ctx.options.databases);

  if (!id) {
    exitWithValidationError("backup_id", UPDATE_USAGE, ctx.formatter);
  }

  if (!server) {
    exitWithValidationError("server_id", UPDATE_USAGE, ctx.formatter);
  }

  if (typeof storageProvider !== "string" || !storageProvider) {
    exitWithValidationError("storage-provider", UPDATE_USAGE, ctx.formatter);
  }

  if (typeof frequency !== "string" || !frequency) {
    exitWithValidationError("frequency", UPDATE_USAGE, ctx.formatter);
  }

  if (ctx.options.retention === undefined) {
    exitWithValidationError("retention", UPDATE_USAGE, ctx.formatter);
  }

  if (databases.length === 0) {
    exitWithValidationError("databases", UPDATE_USAGE, ctx.formatter);
  }

  await runCommand(async () => {
    checkFrequency(frequency);
    const retention = parseRetention(ctx.options.retention);
    const token = ctx.getToken();
    const execCtx = ctx.createExecutorContext(token);
    const server_id = await resolveServerId(server, execCtx);
    const storage_provider_id = await resolveStorageProviderId(storageProvider, execCtx);
    const database_ids = await resolveDatabaseIds(databases, server_id, execCtx);
    await updateBackupConfig(
      {
        server_id,
        id,
        storage_provider_id,
        frequency,
        retention,
        database_ids,
        ...optionalBackupFields(ctx.options),
      },
      execCtx,
    );
    ctx.formatter.success(`Backup configuration ${id} updated.`);
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
