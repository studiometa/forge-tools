import { createSite, deleteSite, getSite, listSites } from "@studiometa/forge-core";

import { createResourceHandler } from "./factory.ts";

export const handleSites = createResourceHandler({
  resource: "sites",
  actions: ["list", "get", "create", "delete"],
  requiredFields: {
    list: ["server_id"],
    get: ["server_id", "id"],
    create: ["server_id", "domain"],
    delete: ["server_id", "id"],
  },
  executors: {
    list: listSites,
    get: getSite,
    create: createSite,
    delete: deleteSite,
  },
  mapOptions: (action, args) => {
    switch (action) {
      case "list":
        return { server_id: args.server_id };
      case "get":
        return { server_id: args.server_id, site_id: args.id };
      case "create":
        return {
          server_id: args.server_id,
          domain: args.domain,
          project_type: args.project_type ?? "php",
          directory: args.directory,
        };
      case "delete":
        return { server_id: args.server_id, site_id: args.id };
      default:
        return {};
    }
  },
});
