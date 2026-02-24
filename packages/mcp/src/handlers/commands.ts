import { createCommand, getCommand, listCommands } from "@studiometa/forge-core";

import type { ForgeCommand } from "@studiometa/forge-api";

import { formatCommand, formatCommandList } from "../formatters.ts";
import { createResourceHandler } from "./factory.ts";

export const handleCommands = createResourceHandler({
  resource: "commands",
  actions: ["list", "get", "create"],
  requiredFields: {
    list: ["server_id", "site_id"],
    get: ["server_id", "site_id", "id"],
    create: ["server_id", "site_id", "command"],
  },
  executors: {
    list: listCommands,
    get: getCommand,
    create: createCommand,
  },
  formatResult: (action, data) => {
    switch (action) {
      case "list":
        return formatCommandList(data as ForgeCommand[]);
      case "get":
        return formatCommand(data as ForgeCommand);
      case "create":
        return formatCommand(data as ForgeCommand);
      default:
        return "Done.";
    }
  },
});
