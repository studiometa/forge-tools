import type { StorageProviderAttributes } from "@studiometa/forge-api";

import { STORAGE_PROVIDER_TYPES } from "@studiometa/forge-api";
import {
  createStorageProvider,
  deleteStorageProvider,
  getStorageProvider,
  listStorageProviders,
} from "@studiometa/forge-core";

import type { CommandContext } from "../../context.ts";

import { exitWithError, exitWithValidationError, runCommand } from "../../error-handler.ts";
import { ValidationError } from "../../errors.ts";
import { readContentFile } from "../../utils/content-source.ts";

type StorageProvider = StorageProviderAttributes & { id: number };

const FIELDS: Array<keyof StorageProvider> = [
  "id",
  "name",
  "provider",
  "provider_name",
  "endpoint",
  "region",
  "bucket",
  "directory",
  "in_use",
];

const CREATE_USAGE =
  "forge storage-providers create --name <name> --provider <type> [--endpoint <url>] [--region <region>] [--bucket <bucket>] [--access-key <id>] [--secret-key-file <path|->]";

export async function storageProvidersList(ctx: CommandContext): Promise<void> {
  const provider = typeof ctx.options.provider === "string" ? ctx.options.provider : undefined;

  await runCommand(async () => {
    const token = ctx.getToken();
    const execCtx = ctx.createExecutorContext(token);
    const result = await listStorageProviders(provider ? { provider } : {}, execCtx);
    ctx.formatter.outputList(
      result.data,
      ["id", "name", "provider", "bucket", "in_use"],
      "No storage providers found.",
      (p) =>
        `${String(p.id).padEnd(8)} ${p.name.padEnd(24)} ${p.provider.padEnd(10)} ${p.bucket ?? "—"}${p.in_use ? " (in use)" : ""}`,
    );
  }, ctx.formatter);
}

export async function storageProvidersGet(args: string[], ctx: CommandContext): Promise<void> {
  const [id] = args;

  if (!id) {
    exitWithValidationError("id", "forge storage-providers get <id>", ctx.formatter);
  }

  await runCommand(async () => {
    const token = ctx.getToken();
    const execCtx = ctx.createExecutorContext(token);
    const result = await getStorageProvider({ id }, execCtx);
    ctx.formatter.outputOne(result.data, FIELDS);
  }, ctx.formatter);
}

/**
 * Read an optional string option. A flag given without a value is a validation error.
 */
function stringOption(ctx: CommandContext, name: string): string | undefined {
  const value = ctx.options[name];
  if (value === undefined) return undefined;
  if (typeof value !== "string" || !value) {
    exitWithError(
      new ValidationError(`--${name} requires a value`, name, [`Usage: ${CREATE_USAGE}`]),
      ctx.formatter,
    );
  }
  return value;
}

export async function storageProvidersCreate(ctx: CommandContext): Promise<void> {
  const name = ctx.options.name;
  const provider = ctx.options.provider;

  if (typeof name !== "string" || !name) {
    exitWithValidationError("name", CREATE_USAGE, ctx.formatter);
  }

  if (typeof provider !== "string" || !provider) {
    exitWithValidationError("provider", CREATE_USAGE, ctx.formatter);
  }

  if (!(STORAGE_PROVIDER_TYPES as readonly string[]).includes(provider)) {
    exitWithError(
      new ValidationError(
        `Invalid provider "${provider}": use ${STORAGE_PROVIDER_TYPES.join(", ")}`,
        "provider",
      ),
      ctx.formatter,
    );
  }

  const endpoint = stringOption(ctx, "endpoint");
  const region = stringOption(ctx, "region");
  const bucket = stringOption(ctx, "bucket");
  const directory = stringOption(ctx, "directory");
  const accessKey = stringOption(ctx, "access-key");

  // The secret key is read from a file or stdin, never from the command line,
  // so it does not show in the shell history or the process list. Only one
  // trailing newline is removed (as `echo` or an editor adds it): a secret is kept as is.
  const secretKey =
    ctx.options["secret-key-file"] === undefined
      ? undefined
      : readContentFile(ctx.options["secret-key-file"], "secret-key-file", {
          label: "secret key",
          usage: CREATE_USAGE,
          formatter: ctx.formatter,
        }).replace(/\r?\n$/, "");

  await runCommand(async () => {
    const token = ctx.getToken();
    const execCtx = ctx.createExecutorContext(token);
    const result = await createStorageProvider(
      {
        name,
        provider: provider as (typeof STORAGE_PROVIDER_TYPES)[number],
        ...(endpoint !== undefined ? { endpoint } : {}),
        ...(region !== undefined ? { region } : {}),
        ...(bucket !== undefined ? { bucket } : {}),
        ...(directory !== undefined ? { directory } : {}),
        ...(accessKey !== undefined ? { access_key: accessKey } : {}),
        ...(secretKey !== undefined ? { secret_key: secretKey } : {}),
        ...(ctx.options["assume-role"] === true ? { assume_role: true } : {}),
      },
      execCtx,
    );
    ctx.formatter.outputOne(result.data, FIELDS);
  }, ctx.formatter);
}

export async function storageProvidersDelete(args: string[], ctx: CommandContext): Promise<void> {
  const [id] = args;

  if (!id) {
    exitWithValidationError("id", "forge storage-providers delete <id>", ctx.formatter);
  }

  await runCommand(async () => {
    const token = ctx.getToken();
    const execCtx = ctx.createExecutorContext(token);
    await deleteStorageProvider({ id }, execCtx);
    ctx.formatter.success(`Storage provider ${id} deleted.`);
  }, ctx.formatter);
}
