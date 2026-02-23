import {
  createFirewallRule,
  deleteFirewallRule,
  getFirewallRule,
  listFirewallRules,
} from "@studiometa/forge-core";

import { createResourceHandler } from "./factory.ts";

export const handleFirewallRules = createResourceHandler({
  resource: "firewall-rules",
  actions: ["list", "get", "create", "delete"],
  requiredFields: {
    list: ["server_id"],
    get: ["server_id", "id"],
    create: ["server_id", "name", "port"],
    delete: ["server_id", "id"],
  },
  executors: {
    list: listFirewallRules,
    get: getFirewallRule,
    create: createFirewallRule,
    delete: deleteFirewallRule,
  },
});
