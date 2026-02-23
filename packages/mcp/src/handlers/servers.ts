import {
  createServer,
  deleteServer,
  getServer,
  listServers,
  rebootServer,
} from "@studiometa/forge-core";

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
  mapOptions: (action, args) => {
    switch (action) {
      case "get":
      case "delete":
      case "reboot":
        return { server_id: args.id };
      case "create":
        return {
          provider: args.provider,
          credential_id: Number(args.credential_id) || 0,
          name: args.name,
          type: args.type ?? "app",
          size: args.size ?? "",
          region: args.region,
        };
      default:
        return {};
    }
  },
});
