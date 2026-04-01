import * as v from "valibot";
import { getEnv, updateEnv } from "@studiometa/forge-core";

import { formatEnv } from "../formatters.ts";
import { createResourceHandler } from "./factory.ts";

export const handleEnv = createResourceHandler({
  resource: "env",
  actions: ["get", "update"],
  inputSchemas: {
    get: v.object({ server_id: v.string(), site_id: v.string() }),
    update: v.object({ server_id: v.string(), site_id: v.string(), content: v.string() }),
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
      /* v8 ignore next */
      default:
        return "Done.";
    }
  },
});
