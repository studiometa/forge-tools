import * as v from "valibot";
import { createCommand, getCommand, listCommands } from "@studiometa/forge-core";

import { formatCommand, formatCommandList } from "../formatters.ts";
import { createResourceHandler } from "./factory.ts";

export const handleCommands = createResourceHandler({
  resource: "commands",
  actions: ["list", "get", "create"],
  inputSchemas: {
    list: v.object({ server_id: v.string(), site_id: v.string() }),
    get: v.object({ server_id: v.string(), site_id: v.string(), id: v.string() }),
    create: v.object({ server_id: v.string(), site_id: v.string(), command: v.string() }),
  },
  executors: {
    list: listCommands,
    get: getCommand,
    create: createCommand,
  },
  formatResult: (action, data) => {
    switch (action) {
      case "list":
        return formatCommandList(data);
      case "get":
        return formatCommand(data);
      case "create":
        return "Done.";
      /* v8 ignore next */
      default:
        return "Done.";
    }
  },
});
