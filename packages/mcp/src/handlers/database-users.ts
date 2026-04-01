import * as v from "valibot";
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
  inputSchemas: {
    list: v.object({ server_id: v.string() }),
    get: v.object({ server_id: v.string(), id: v.string() }),
    create: v.object({ server_id: v.string(), name: v.string(), password: v.string() }),
    delete: v.object({ server_id: v.string(), id: v.string() }),
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
