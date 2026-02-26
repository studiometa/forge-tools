import {
  createServer,
  deleteServer,
  getServer,
  listServers,
  rebootServer,
} from "@studiometa/forge-core";

import type { ForgeServer } from "@studiometa/forge-api";

import { formatServer, formatServerList } from "../formatters.ts";
import { getServerHints } from "../hints.ts";
import { createResourceHandler } from "./factory.ts";

export const handleServers = createResourceHandler({
  resource: "servers",
  actions: ["list", "get", "create", "delete", "reboot"],
  requiredFields: {
    get: ["id"],
    create: ["provider", "name", "type", "region"],
    delete: ["id"],
    reboot: ["id"],
  },
  executors: {
    list: listServers,
    get: getServer,
    create: createServer,
    delete: deleteServer,
    reboot: rebootServer,
  },
  hints: (_data, id) => getServerHints(id),
  mapOptions: (action, args) => {
    switch (action) {
      case "get":
      case "delete":
      case "reboot":
        return { server_id: args.id };
      case "create":
        return {
          provider: args.provider,
          /* v8 ignore next */
          credential_id: Number(args.credential_id) || 0,
          name: args.name,
          /* v8 ignore next */
          type: args.type ?? "app",
          /* v8 ignore next */
          size: args.size ?? "",
          region: args.region,
        };
      default:
        return {};
    }
  },
  formatResult: (action, data, args) => {
    switch (action) {
      case "list":
        return formatServerList(data as ForgeServer[]);
      case "get":
        return formatServer(data as ForgeServer);
      case "create":
        return formatServer(data as ForgeServer);
      case "delete":
        return `Server ${args.id} deleted.`;
      case "reboot":
        return `Server ${args.id} reboot initiated.`;
      /* v8 ignore next */
      default:
        return "Done.";
    }
  },
});
