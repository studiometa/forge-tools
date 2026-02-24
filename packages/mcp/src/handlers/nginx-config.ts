import { getNginxConfig, updateNginxConfig } from "@studiometa/forge-core";

import { formatNginxConfig } from "../formatters.ts";
import { createResourceHandler } from "./factory.ts";

export const handleNginxConfig = createResourceHandler({
  resource: "nginx",
  actions: ["get", "update"],
  requiredFields: {
    get: ["server_id", "site_id"],
    update: ["server_id", "site_id", "content"],
  },
  executors: {
    get: getNginxConfig,
    update: updateNginxConfig,
  },
  mapOptions: (_action, args) => ({
    server_id: args.server_id,
    site_id: args.site_id,
    content: args.content,
  }),
  formatResult: (action, data) => {
    switch (action) {
      case "get":
        return formatNginxConfig(data as string);
      case "update":
        return "Nginx configuration updated.";
      default:
        return "Done.";
    }
  },
});
