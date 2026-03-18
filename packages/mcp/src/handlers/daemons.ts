import {
  createDaemon,
  deleteDaemon,
  getDaemon,
  listDaemons,
  restartDaemon,
} from "@studiometa/forge-core";

import { formatDaemon, formatDaemonList } from "../formatters.ts";
import { getDaemonHints } from "../hints.ts";
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
  hints: (_data, id, args) => getDaemonHints(String(args.server_id), id),
  formatResult: (action, data, args) => {
    switch (action) {
      case "list":
        return formatDaemonList(data);
      case "get":
        return formatDaemon(data);
      case "create":
        return formatDaemon(data);
      case "delete":
        return `Daemon ${args.id} deleted.`;
      case "restart":
        return `Daemon ${args.id} restarted.`;
      /* v8 ignore next */
      default:
        return "Done.";
    }
  },
});
