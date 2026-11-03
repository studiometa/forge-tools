import * as v from "valibot";
import {
  createBackupConfig,
  deleteBackupConfig,
  getBackupConfig,
  listBackupConfigs,
  updateBackupConfig,
} from "@studiometa/forge-core";

import { formatBackupConfig, formatBackupConfigList } from "../formatters.ts";
import { createResourceHandler } from "./factory.ts";

export const handleBackups = createResourceHandler({
  resource: "backups",
  actions: ["list", "get", "create", "update", "delete"],
  inputSchemas: {
    list: v.object({ server_id: v.string() }),
    get: v.object({ server_id: v.string(), id: v.string() }),
    create: v.object({
      server_id: v.string(),
      storage_provider_id: v.number(),
      frequency: v.picklist(["hourly", "daily", "weekly", "custom"]),
      retention: v.number(),
      database_ids: v.pipe(v.array(v.number()), v.minLength(1)),
      include_new_databases: v.optional(v.boolean()),
      name: v.optional(v.nullable(v.string())),
      bucket: v.optional(v.nullable(v.string())),
      directory: v.optional(v.nullable(v.string())),
      day: v.optional(v.string()),
      time: v.optional(v.string()),
      cron: v.optional(v.string()),
      notification_email: v.optional(v.nullable(v.string())),
    }),
    update: v.object({
      server_id: v.string(),
      id: v.string(),
      storage_provider_id: v.number(),
      frequency: v.string(),
      retention: v.number(),
      database_ids: v.array(v.number()),
      name: v.optional(v.nullable(v.string())),
      bucket: v.optional(v.nullable(v.string())),
      directory: v.optional(v.nullable(v.string())),
      day: v.optional(v.string()),
      time: v.optional(v.string()),
      cron: v.optional(v.string()),
      notification_email: v.optional(v.nullable(v.string())),
    }),
    delete: v.object({ server_id: v.string(), id: v.string() }),
  },
  executors: {
    list: listBackupConfigs,
    get: getBackupConfig,
    create: createBackupConfig,
    update: updateBackupConfig,
    delete: deleteBackupConfig,
  },
  formatResult: (action, data, args) => {
    switch (action) {
      case "list":
        return formatBackupConfigList(data);
      case "get":
        return formatBackupConfig(data);
      case "create":
        return "Done.";
      case "update":
        return "Done.";
      case "delete":
        return `Backup config ${args.id} deleted.`;
      /* v8 ignore next */
      default:
        return "Done.";
    }
  },
});
