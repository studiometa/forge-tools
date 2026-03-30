import * as v from "valibot";
import { getNginxConfig, updateNginxConfig } from "@studiometa/forge-core";

import { formatNginxConfig } from "../formatters.ts";
import { createResourceHandler } from "./factory.ts";

export const handleNginxConfig = createResourceHandler({
  resource: "nginx",
  actions: ["get", "update"],
  inputSchemas: {
    get: v.object({ server_id: v.string(), site_id: v.string() }),
    update: v.object({ server_id: v.string(), site_id: v.string(), content: v.string() }),
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
      /* v8 ignore next */
      default:
        return "Done.";
    }
  },
});
