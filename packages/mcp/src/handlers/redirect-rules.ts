import {
  createRedirectRule,
  deleteRedirectRule,
  getRedirectRule,
  listRedirectRules,
} from "@studiometa/forge-core";

import { createResourceHandler } from "./factory.ts";

export const handleRedirectRules = createResourceHandler({
  resource: "redirect-rules",
  actions: ["list", "get", "create", "delete"],
  requiredFields: {
    list: ["server_id", "site_id"],
    get: ["server_id", "site_id", "id"],
    create: ["server_id", "site_id", "from", "to"],
    delete: ["server_id", "site_id", "id"],
  },
  executors: {
    list: listRedirectRules,
    get: getRedirectRule,
    create: createRedirectRule,
    delete: deleteRedirectRule,
  },
});
