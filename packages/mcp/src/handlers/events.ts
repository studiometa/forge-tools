import * as v from "valibot";
import { getEvent, getEventOutput, listEvents } from "@studiometa/forge-core";

import { formatEvent, formatEventList, formatEventOutput } from "../formatters.ts";
import { createResourceHandler } from "./factory.ts";

export const handleEvents = createResourceHandler({
  resource: "events",
  actions: ["list", "get", "log"],
  inputSchemas: {
    list: v.object({
      server_id: v.optional(v.string()),
      initiated_by: v.optional(v.string()),
      ran_as: v.optional(v.string()),
    }),
    get: v.object({ server_id: v.string(), id: v.string() }),
    log: v.object({ server_id: v.string(), id: v.string() }),
  },
  executors: {
    list: listEvents,
    get: getEvent,
    log: getEventOutput,
  },
  mapOptions: (action, args) =>
    action === "list"
      ? {
          ...(args.server_id ? { server_id: args.server_id } : {}),
          ...(args.initiated_by ? { initiated_by: args.initiated_by as string } : {}),
          ...(args.ran_as ? { ran_as: args.ran_as as string } : {}),
        }
      : { server_id: args.server_id, id: args.id },
  formatResult: (action, data, args) => {
    switch (action) {
      case "list":
        return formatEventList(data);
      case "get":
        return formatEvent(data);
      case "log":
        return formatEventOutput(String(args.id), data);
      /* v8 ignore next */
      default:
        return "Done.";
    }
  },
});
