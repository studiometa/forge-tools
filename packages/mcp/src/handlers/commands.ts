import { createCommand, getCommand, listCommands } from "@studiometa/forge-core";

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
});
