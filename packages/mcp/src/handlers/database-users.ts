import {
  createDatabaseUser,
  deleteDatabaseUser,
  getDatabaseUser,
  listDatabaseUsers,
} from "@studiometa/forge-core";

import type { ForgeDatabaseUser } from "@studiometa/forge-api";

import { formatDatabaseUser, formatDatabaseUserList } from "../formatters.ts";
import { getDatabaseUserHints } from "../hints.ts";
import { createResourceHandler } from "./factory.ts";

export const handleDatabaseUsers = createResourceHandler({
  resource: "database-users",
  actions: ["list", "get", "create", "delete"],
  requiredFields: {
    list: ["server_id"],
    get: ["server_id", "id"],
    create: ["server_id", "name", "password"],
    delete: ["server_id", "id"],
  },
  executors: {
    list: listDatabaseUsers,
    get: getDatabaseUser,
    create: createDatabaseUser,
    delete: deleteDatabaseUser,
  },
  hints: (data, id) => {
    const user = data as ForgeDatabaseUser;
    return getDatabaseUserHints(String(user.server_id), id);
  },
  formatResult: (action, data, args) => {
    switch (action) {
      case "list":
        return formatDatabaseUserList(data as ForgeDatabaseUser[]);
      case "get":
        return formatDatabaseUser(data as ForgeDatabaseUser);
      case "create":
        return formatDatabaseUser(data as ForgeDatabaseUser);
      case "delete":
        return `Database user ${args.id} deleted.`;
      default:
        return "Done.";
    }
  },
});
