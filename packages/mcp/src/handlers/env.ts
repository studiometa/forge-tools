import { getEnv, updateEnv } from "@studiometa/forge-core";

import { formatEnv } from "../formatters.ts";
import { createResourceHandler } from "./factory.ts";

export const handleEnv = createResourceHandler({
  resource: "env",
  actions: ["get", "update"],
  requiredFields: {
    get: ["server_id", "site_id"],
    update: ["server_id", "site_id", "content"],
  },
  executors: {
    get: getEnv,
    update: updateEnv,
  },
  mapOptions: (_action, args) => ({
    server_id: args.server_id,
    site_id: args.site_id,
    content: args.content,
  }),
  formatResult: (action, data) => {
    switch (action) {
      case "get":
        return formatEnv(data as string);
      case "update":
        return "Environment variables updated.";
      default:
        return "Done.";
    }
  },
});
