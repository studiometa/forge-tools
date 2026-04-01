import * as v from "valibot";
import { createDatabase, deleteDatabase, getDatabase, listDatabases } from "@studiometa/forge-core";

import { formatDatabase, formatDatabaseList } from "../formatters.ts";
import { getDatabaseHints } from "../hints.ts";
import { createResourceHandler } from "./factory.ts";

export const handleDatabases = createResourceHandler({
  resource: "databases",
  actions: ["list", "get", "create", "delete"],
  inputSchemas: {
    list: v.object({ server_id: v.string() }),
    get: v.object({ server_id: v.string(), id: v.string() }),
    create: v.object({ server_id: v.string(), name: v.string() }),
    delete: v.object({ server_id: v.string(), id: v.string() }),
  },
  executors: {
    list: listDatabases,
    get: getDatabase,
    create: createDatabase,
    delete: deleteDatabase,
  },
  hints: (_data, id, args) => getDatabaseHints(String(args.server_id), id),
  formatResult: (action, data, args) => {
    switch (action) {
      case "list":
        return formatDatabaseList(data);
      case "get":
        return formatDatabase(data);
      case "create":
        return formatDatabase(data);
      case "delete":
        return `Database ${args.id} deleted.`;
      /* v8 ignore next */
      default:
        return "Done.";
    }
  },
});
