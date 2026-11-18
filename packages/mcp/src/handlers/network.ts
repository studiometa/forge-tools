import * as v from "valibot";
import { getServerNetwork, updateServerNetwork } from "@studiometa/forge-core";

import { formatServerList } from "../formatters.ts";
import { createResourceHandler } from "./factory.ts";

export const handleNetwork = createResourceHandler({
  resource: "network",
  actions: ["get", "update"],
  inputSchemas: {
    get: v.object({ server_id: v.string() }),
    update: v.object({ server_id: v.string(), servers: v.array(v.number()) }),
  },
  executors: {
    get: getServerNetwork,
    update: updateServerNetwork,
  },
  mapOptions: (action, args) =>
    action === "update"
      ? { server_id: args.server_id, servers: args.servers }
      : { server_id: args.server_id },
  formatResult: (action, data, args) =>
    action === "get"
      ? formatServerList(data)
      : `Network of server ${String(args.server_id)} updated.`,
});
