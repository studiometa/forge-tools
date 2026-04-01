import * as v from "valibot";
import { createMonitor, deleteMonitor, getMonitor, listMonitors } from "@studiometa/forge-core";

import { formatMonitor, formatMonitorList } from "../formatters.ts";
import { createResourceHandler } from "./factory.ts";

export const handleMonitors = createResourceHandler({
  resource: "monitors",
  actions: ["list", "get", "create", "delete"],
  inputSchemas: {
    list: v.object({ server_id: v.string() }),
    get: v.object({ server_id: v.string(), id: v.string() }),
    create: v.object({
      server_id: v.string(),
      type: v.string(),
      operator: v.string(),
      threshold: v.string(),
      minutes: v.string(),
    }),
    delete: v.object({ server_id: v.string(), id: v.string() }),
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
        return formatMonitorList(data);
      case "get":
        return formatMonitor(data);
      case "create":
        return formatMonitor(data);
      case "delete":
        return `Monitor ${args.id} deleted.`;
      /* v8 ignore next */
      default:
        return "Done.";
    }
  },
});
