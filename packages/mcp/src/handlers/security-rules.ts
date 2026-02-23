import {
  createSecurityRule,
  deleteSecurityRule,
  getSecurityRule,
  listSecurityRules,
} from "@studiometa/forge-core";

import { createResourceHandler } from "./factory.ts";

export const handleSecurityRules = createResourceHandler({
  resource: "security-rules",
  actions: ["list", "get", "create", "delete"],
  requiredFields: {
    list: ["server_id", "site_id"],
    get: ["server_id", "site_id", "id"],
    create: ["server_id", "site_id", "name", "credentials"],
    delete: ["server_id", "site_id", "id"],
  },
  executors: {
    list: listSecurityRules,
    get: getSecurityRule,
    create: createSecurityRule,
    delete: deleteSecurityRule,
  },
});
