import {
  createDaemon,
  deleteDaemon,
  getDaemon,
  listDaemons,
  restartDaemon,
} from "@studiometa/forge-core";

import type { ForgeDaemon } from "@studiometa/forge-api";

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
  hints: (data, id) => {
    const daemon = data as ForgeDaemon;
    return getDaemonHints(String(daemon.server_id), id);
  },
  formatResult: (action, data, args) => {
    switch (action) {
      case "list":
        return formatDaemonList(data as ForgeDaemon[]);
      case "get":
        return formatDaemon(data as ForgeDaemon);
      case "create":
        return formatDaemon(data as ForgeDaemon);
      case "delete":
        return `Daemon ${args.id} deleted.`;
      case "restart":
        return `Daemon ${args.id} restarted.`;
      default:
        return "Done.";
    }
  },
});
