import { createCommandRouter } from "../../utils/command-router.ts";
import {
  databaseUsersCreate,
  databaseUsersDelete,
  databaseUsersGet,
  databaseUsersList,
  databaseUsersUpdate,
} from "./handlers.ts";

export const handleDatabaseUsersCommand = createCommandRouter({
  resource: "database-users",
  handlers: {
    list: databaseUsersList,
    ls: databaseUsersList,
    get: [databaseUsersGet, "args"],
    create: databaseUsersCreate,
    update: [databaseUsersUpdate, "args"],
    delete: [databaseUsersDelete, "args"],
  },
  writeSubcommands: ["create", "update", "delete"],
});
