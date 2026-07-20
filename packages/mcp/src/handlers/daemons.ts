import * as v from "valibot";
import {
  createDaemon,
  deleteDaemon,
  getDaemon,
  getDaemonLog,
  listDaemons,
  restartDaemon,
  updateDaemon,
} from "@studiometa/forge-core";

import { formatDaemon, formatDaemonList, formatDaemonLog } from "../formatters.ts";
import { getDaemonHints } from "../hints.ts";
import { createResourceHandler } from "./factory.ts";

export const handleDaemons = createResourceHandler({
  resource: "daemons",
  actions: ["list", "get", "create", "update", "delete", "restart", "log"],
  inputSchemas: {
    list: v.object({ server_id: v.string() }),
    get: v.object({ server_id: v.string(), id: v.string() }),
    log: v.object({ server_id: v.string(), id: v.string() }),
    create: v.object({ server_id: v.string(), command: v.string() }),
    update: v.object({
      server_id: v.string(),
      id: v.string(),
      name: v.string(),
      config: v.optional(v.string()),
    }),
    delete: v.object({ server_id: v.string(), id: v.string() }),
    restart: v.object({ server_id: v.string(), id: v.string() }),
  },
  executors: {
    list: listDaemons,
    get: getDaemon,
    create: createDaemon,
    update: updateDaemon,
    delete: deleteDaemon,
    restart: restartDaemon,
    log: getDaemonLog,
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
      case "update":
        return formatDaemon(data);
      case "delete":
        return `Daemon ${args.id} deleted.`;
      case "restart":
        return `Daemon ${args.id} restarted.`;
      case "log":
        return formatDaemonLog(String(args.id), data);
      /* v8 ignore next */
      default:
        return "Done.";
    }
  },
});
