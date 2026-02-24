import { createCommandRouter } from "../../utils/command-router.ts";
import {
  databaseUsersCreate,
  databaseUsersDelete,
  databaseUsersGet,
  databaseUsersList,
} from "./handlers.ts";

export const handleDatabaseUsersCommand = createCommandRouter({
  resource: "database-users",
  handlers: {
    list: databaseUsersList,
    ls: databaseUsersList,
    get: [databaseUsersGet, "args"],
    create: databaseUsersCreate,
    delete: [databaseUsersDelete, "args"],
  },
});
