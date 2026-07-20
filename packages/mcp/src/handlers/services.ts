import * as v from "valibot";
import { listServices, restartService } from "@studiometa/forge-core";

import { formatServiceList } from "../formatters.ts";
import { createResourceHandler } from "./factory.ts";

export const handleServices = createResourceHandler({
  resource: "services",
  actions: ["list", "restart"],
  inputSchemas: {
    list: v.object({ server_id: v.string() }),
    restart: v.object({
      server_id: v.string(),
      service: v.string(),
      version: v.optional(v.string()),
    }),
  },
  executors: {
    list: listServices,
    restart: restartService,
  },
  formatResult: (action, data, args) => {
    switch (action) {
      case "list":
        return formatServiceList(data);
      case "restart":
        return `${String(args.service)} restart initiated on server ${String(args.server_id)}.`;
      /* v8 ignore next */
      default:
        return "Done.";
    }
  },
});
