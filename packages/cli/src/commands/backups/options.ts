/**
 * Read and resolve the options shared by `forge backups create` and `forge backups update`.
 */

import type { ExecutorContext } from "@studiometa/forge-core";
import type { CreateBackupConfigData } from "@studiometa/forge-api";

import { listDatabases, listStorageProviders } from "@studiometa/forge-core";

import type { CommandOptions } from "../../context.ts";

import { ValidationError } from "../../errors.ts";

/** Backup frequencies accepted by Forge. */
export const BACKUP_FREQUENCIES = ["hourly", "daily", "weekly", "custom"] as const;

/**
 * Read a list option: repeated and/or comma separated (`--databases 1,2 --databases app`).
 */
export function listValues(value: unknown): string[] {
  return [value]
    .flat()
    .filter((v): v is string => typeof v === "string")
    .flatMap((v) => v.split(","))
    .map((v) => v.trim())
    .filter(Boolean);
}

/**
 * Whether a value is a numeric ID.
 */
function isId(value: string): boolean {
  return /^\d+$/.test(value);
}

/**
 * Check the --frequency value. Throws a ValidationError for an unknown frequency.
 */
export function checkFrequency(frequency: string): void {
  if (!(BACKUP_FREQUENCIES as readonly string[]).includes(frequency)) {
    throw new ValidationError(
      `Invalid frequency "${frequency}": use ${BACKUP_FREQUENCIES.join(", ")}`,
      "frequency",
    );
  }
}

/**
 * Parse the --retention value: an integer from 1 to 8760.
 */
export function parseRetention(value: unknown): number {
  const retention = Number(value);
  if (!Number.isInteger(retention) || retention < 1 || retention > 8760) {
    throw new ValidationError(
      `Invalid retention "${String(value)}": use a number of backups from 1 to 8760`,
      "retention",
    );
  }
  return retention;
}

/**
 * Resolve a storage provider ID or exact name to its numeric ID.
 */
export async function resolveStorageProviderId(
  value: string,
  execCtx: ExecutorContext,
): Promise<number> {
  if (isId(value)) return Number(value);

  const { data } = await listStorageProviders({}, execCtx);
  const matches = data.filter((p) => p.name === value);

  if (matches.length === 0) {
    throw new ValidationError(`No storage provider named "${value}"`, "storage-provider", [
      "List the storage providers with: forge storage-providers list",
    ]);
  }
  if (matches.length > 1) {
    throw new ValidationError(
      `${matches.length} storage providers are named "${value}": use the ID (${matches.map((p) => p.id).join(", ")})`,
      "storage-provider",
    );
  }
  return matches[0].id;
}

/**
 * Resolve database IDs or exact names to numeric IDs. Names are looked up on the server.
 */
export async function resolveDatabaseIds(
  values: string[],
  server_id: string,
  execCtx: ExecutorContext,
): Promise<number[]> {
  if (values.every(isId)) return values.map(Number);

  const { data } = await listDatabases({ server_id }, execCtx);

  return values.map((value) => {
    if (isId(value)) return Number(value);
    const database = data.find((db) => db.name === value);
    if (!database) {
      throw new ValidationError(`No database named "${value}" on the server`, "databases", [
        `List the databases with: forge databases list --server ${server_id}`,
      ]);
    }
    return database.id;
  });
}

/**
 * Read the optional backup configuration fields that map one to one to the API.
 */
export function optionalBackupFields(
  options: CommandOptions,
): Pick<
  CreateBackupConfigData,
  "name" | "bucket" | "directory" | "day" | "time" | "cron" | "notification_email"
> {
  const fields: Record<string, string> = {};
  const map: Record<string, string> = {
    name: "name",
    bucket: "bucket",
    directory: "directory",
    day: "day",
    time: "time",
    cron: "cron",
    "notification-email": "notification_email",
  };
  for (const [option, field] of Object.entries(map)) {
    const value = options[option];
    if (typeof value === "string") fields[field] = value;
  }
  return fields;
}
