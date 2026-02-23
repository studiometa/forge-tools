import { createMonitor, deleteMonitor, getMonitor, listMonitors } from "@studiometa/forge-core";

import { createResourceHandler } from "./factory.ts";

export const handleMonitors = createResourceHandler({
  resource: "monitors",
  actions: ["list", "get", "create", "delete"],
  requiredFields: {
    list: ["server_id"],
    get: ["server_id", "id"],
    create: ["server_id", "type", "operator", "threshold", "minutes"],
    delete: ["server_id", "id"],
  },
  executors: {
    list: listMonitors,
    get: getMonitor,
    create: createMonitor,
    delete: deleteMonitor,
  },
});
