import {
  createDatabaseUser,
  deleteDatabaseUser,
  getDatabaseUser,
  listDatabaseUsers,
} from "@studiometa/forge-core";

import type { CommandContext } from "../../context.ts";

import { exitWithValidationError, runCommand } from "../../error-handler.ts";

export async function databaseUsersList(ctx: CommandContext): Promise<void> {
  const server_id = String(ctx.options.server ?? "");

  if (!server_id) {
    exitWithValidationError(
      "server_id",
      "forge-cli database-users list --server <server_id>",
      ctx.formatter,
    );
  }

  await runCommand(async () => {
    const token = ctx.getToken();
    const execCtx = ctx.createExecutorContext(token);
    const result = await listDatabaseUsers({ server_id }, execCtx);
    ctx.formatter.output(result.data);
  }, ctx.formatter);
}

export async function databaseUsersGet(args: string[], ctx: CommandContext): Promise<void> {
  const [id] = args;
  const server_id = String(ctx.options.server ?? "");

  if (!id) {
    exitWithValidationError(
      "user_id",
      "forge-cli database-users get <user_id> --server <server_id>",
      ctx.formatter,
    );
  }

  if (!server_id) {
    exitWithValidationError(
      "server_id",
      "forge-cli database-users get <user_id> --server <server_id>",
      ctx.formatter,
    );
  }

  await runCommand(async () => {
    const token = ctx.getToken();
    const execCtx = ctx.createExecutorContext(token);
    const result = await getDatabaseUser({ server_id, id }, execCtx);
    ctx.formatter.output(result.data);
  }, ctx.formatter);
}

export async function databaseUsersCreate(ctx: CommandContext): Promise<void> {
  const server_id = String(ctx.options.server ?? "");
  const name = String(ctx.options.name ?? "");
  const password = String(ctx.options.password ?? "");
  const databasesRaw = ctx.options.databases;
  const databases = Array.isArray(databasesRaw)
    ? databasesRaw.map(Number)
    : databasesRaw
      ? [Number(databasesRaw)]
      : undefined;

  if (!server_id) {
    exitWithValidationError(
      "server_id",
      "forge-cli database-users create --server <server_id> --name <name> --password <password>",
      ctx.formatter,
    );
  }

  if (!name) {
    exitWithValidationError(
      "name",
      "forge-cli database-users create --server <server_id> --name <name> --password <password>",
      ctx.formatter,
    );
  }

  if (!password) {
    exitWithValidationError(
      "password",
      "forge-cli database-users create --server <server_id> --name <name> --password <password>",
      ctx.formatter,
    );
  }

  await runCommand(async () => {
    const token = ctx.getToken();
    const execCtx = ctx.createExecutorContext(token);
    const result = await createDatabaseUser(
      { server_id, name, password, ...(databases ? { databases } : {}) },
      execCtx,
    );
    ctx.formatter.output(result.data);
  }, ctx.formatter);
}

export async function databaseUsersDelete(args: string[], ctx: CommandContext): Promise<void> {
  const [id] = args;
  const server_id = String(ctx.options.server ?? "");

  if (!id) {
    exitWithValidationError(
      "user_id",
      "forge-cli database-users delete <user_id> --server <server_id>",
      ctx.formatter,
    );
  }

  if (!server_id) {
    exitWithValidationError(
      "server_id",
      "forge-cli database-users delete <user_id> --server <server_id>",
      ctx.formatter,
    );
  }

  await runCommand(async () => {
    const token = ctx.getToken();
    const execCtx = ctx.createExecutorContext(token);
    await deleteDatabaseUser({ server_id, id }, execCtx);
    ctx.formatter.success(`Database user ${id} deleted.`);
  }, ctx.formatter);
}
