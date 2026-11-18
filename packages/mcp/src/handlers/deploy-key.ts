import * as v from "valibot";
import { createSiteDeployKey, deleteSiteDeployKey, getSiteDeployKey } from "@studiometa/forge-core";

import { formatDeployKey } from "../formatters.ts";
import { createResourceHandler } from "./factory.ts";

const siteArgs = v.object({ server_id: v.string(), site_id: v.string() });

export const handleDeployKey = createResourceHandler({
  resource: "deploy-key",
  actions: ["get", "create", "delete"],
  inputSchemas: { get: siteArgs, create: siteArgs, delete: siteArgs },
  executors: {
    get: getSiteDeployKey,
    create: createSiteDeployKey,
    delete: deleteSiteDeployKey,
  },
  mapOptions: (_action, args) => ({ server_id: args.server_id, site_id: args.site_id }),
  formatResult: (action, data, args) =>
    action === "delete"
      ? `Deploy key of site ${String(args.site_id)} deleted.`
      : formatDeployKey(data),
});
