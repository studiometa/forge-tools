import { createDatabase, deleteDatabase, getDatabase, listDatabases } from "@studiometa/forge-core";

import type { ForgeDatabase } from "@studiometa/forge-api";

import { formatDatabase, formatDatabaseList } from "../formatters.ts";
import { getDatabaseHints } from "../hints.ts";
import { createResourceHandler } from "./factory.ts";

export const handleDatabases = createResourceHandler({
  resource: "databases",
  actions: ["list", "get", "create", "delete"],
  requiredFields: {
    list: ["server_id"],
    get: ["server_id", "id"],
    create: ["server_id", "name"],
    delete: ["server_id", "id"],
  },
  executors: {
    list: listDatabases,
    get: getDatabase,
    create: createDatabase,
    delete: deleteDatabase,
  },
  hints: (data, id) => {
    const db = data as ForgeDatabase;
    return getDatabaseHints(String(db.server_id), id);
  },
  formatResult: (action, data, args) => {
    switch (action) {
      case "list":
        return formatDatabaseList(data as ForgeDatabase[]);
      case "get":
        return formatDatabase(data as ForgeDatabase);
      case "create":
        return formatDatabase(data as ForgeDatabase);
      case "delete":
        return `Database ${args.id} deleted.`;
      /* v8 ignore next */
      default:
        return "Done.";
    }
  },
});
