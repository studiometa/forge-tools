import {
  createDatabaseUser,
  deleteDatabaseUser,
  getDatabaseUser,
  listDatabaseUsers,
} from "@studiometa/forge-core";

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
  hints: (_data, id, args) => getDatabaseUserHints(String(args.server_id), id),
  formatResult: (action, data, args) => {
    switch (action) {
      case "list":
        return formatDatabaseUserList(data);
      case "get":
        return formatDatabaseUser(data);
      case "create":
        return formatDatabaseUser(data);
      case "delete":
        return `Database user ${args.id} deleted.`;
      /* v8 ignore next */
      default:
        return "Done.";
    }
  },
});
