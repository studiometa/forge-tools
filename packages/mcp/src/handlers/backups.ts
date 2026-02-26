import {
  createBackupConfig,
  deleteBackupConfig,
  getBackupConfig,
  listBackupConfigs,
} from "@studiometa/forge-core";

import type { ForgeBackupConfig } from "@studiometa/forge-api";

import { formatBackupConfig, formatBackupConfigList } from "../formatters.ts";
import { createResourceHandler } from "./factory.ts";

export const handleBackups = createResourceHandler({
  resource: "backups",
  actions: ["list", "get", "create", "delete"],
  requiredFields: {
    list: ["server_id"],
    get: ["server_id", "id"],
    create: ["server_id", "provider", "credentials", "frequency", "databases"],
    delete: ["server_id", "id"],
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
        return formatBackupConfigList(data as ForgeBackupConfig[]);
      case "get":
        return formatBackupConfig(data as ForgeBackupConfig);
      case "create":
        return formatBackupConfig(data as ForgeBackupConfig);
      case "delete":
        return `Backup config ${args.id} deleted.`;
      /* v8 ignore next */
      default:
        return "Done.";
    }
  },
});
