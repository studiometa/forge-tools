import {
  createBackupConfig,
  deleteBackupConfig,
  getBackupConfig,
  listBackupConfigs,
} from "@studiometa/forge-core";

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
});
