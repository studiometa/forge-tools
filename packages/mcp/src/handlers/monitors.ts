import { createMonitor, deleteMonitor, getMonitor, listMonitors } from "@studiometa/forge-core";

import type { ForgeMonitor } from "@studiometa/forge-api";

import { formatMonitor, formatMonitorList } from "../formatters.ts";
import { createResourceHandler } from "./factory.ts";

export const handleMonitors = createResourceHandler({
  resource: "monitors",
  actions: ["list", "get", "create", "delete"],
  requiredFields: {
    list: ["server_id"],
    get: ["server_id", "id"],
    create: ["server_id", "type", "operator", "threshold", "minutes"],
    delete: ["server_id", "id"],
  },
  executors: {
    list: listMonitors,
    get: getMonitor,
    create: createMonitor,
    delete: deleteMonitor,
  },
  formatResult: (action, data, args) => {
    switch (action) {
      case "list":
        return formatMonitorList(data as ForgeMonitor[]);
      case "get":
        return formatMonitor(data as ForgeMonitor);
      case "create":
        return formatMonitor(data as ForgeMonitor);
      case "delete":
        return `Monitor ${args.id} deleted.`;
      /* v8 ignore next */
      default:
        return "Done.";
    }
  },
});
