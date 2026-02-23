import { createDatabase, deleteDatabase, getDatabase, listDatabases } from "@studiometa/forge-core";

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
});
