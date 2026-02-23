import {
  createDaemon,
  deleteDaemon,
  getDaemon,
  listDaemons,
  restartDaemon,
} from "@studiometa/forge-core";

import { createResourceHandler } from "./factory.ts";

export const handleDaemons = createResourceHandler({
  resource: "daemons",
  actions: ["list", "get", "create", "delete", "restart"],
  requiredFields: {
    list: ["server_id"],
    get: ["server_id", "id"],
    create: ["server_id", "command"],
    delete: ["server_id", "id"],
    restart: ["server_id", "id"],
  },
  executors: {
    list: listDaemons,
    get: getDaemon,
    create: createDaemon,
    delete: deleteDaemon,
    restart: restartDaemon,
  },
});
