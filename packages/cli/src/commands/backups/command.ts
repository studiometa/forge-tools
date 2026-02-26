import { createCommandRouter } from "../../utils/command-router.ts";
import { backupsCreate, backupsDelete, backupsGet, backupsList } from "./handlers.ts";

export const handleBackupsCommand = createCommandRouter({
  resource: "backups",
  handlers: {
    list: backupsList,
    ls: backupsList,
    get: [backupsGet, "args"],
    create: backupsCreate,
    delete: [backupsDelete, "args"],
  },
  writeSubcommands: ["create", "delete"],
});
