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
      type: v.picklist(["cpu_load", "disk", "free_memory", "used_memory"]),
      operator: v.picklist(["gte", "lte"]),
      threshold: v.union([v.number(), v.string()]),
      minutes: v.optional(v.union([v.number(), v.string()])),
      notify: v.string(),
    }),
    delete: v.object({ server_id: v.string(), id: v.string() }),
  },
  executors: {
    list: listMonitors,
    get: getMonitor,
    create: createMonitor,
    delete: deleteMonitor,
  },
  mapOptions: (action, args) => {
    const { resource: _r, action: _a, compact: _c, ...rest } = args;
    if (action !== "create") return rest;
    // The spec takes numbers: the input schema also accepts them as strings.
    return {
      server_id: args.server_id,
      type: args.type,
      operator: args.operator,
      threshold: Number(args.threshold),
      ...(args.minutes === undefined ? {} : { minutes: Number(args.minutes) }),
      notify: args.notify,
    };
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
