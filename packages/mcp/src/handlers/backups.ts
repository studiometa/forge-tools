import * as v from "valibot";
import {
  createBackupConfig,
  deleteBackupConfig,
  getBackupConfig,
  listBackupConfigs,
} from "@studiometa/forge-core";

import { formatBackupConfig, formatBackupConfigList } from "../formatters.ts";
import { createResourceHandler } from "./factory.ts";

export const handleBackups = createResourceHandler({
  resource: "backups",
  actions: ["list", "get", "create", "delete"],
  inputSchemas: {
    list: v.object({ server_id: v.string() }),
    get: v.object({ server_id: v.string(), id: v.string() }),
    create: v.object({
      server_id: v.string(),
      provider: v.string(),
      frequency: v.string(),
      credentials: v.unknown(),
      databases: v.unknown(),
    }),
    delete: v.object({ server_id: v.string(), id: v.string() }),
  },
  executors: {
    list: listBackupConfigs,
    get: getBackupConfig,
    create: createBackupConfig,
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
      case "delete":
        return `Backup config ${args.id} deleted.`;
      /* v8 ignore next */
      default:
        return "Done.";
    }
  },
});
