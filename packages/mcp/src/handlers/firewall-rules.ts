import {
  createFirewallRule,
  deleteFirewallRule,
  getFirewallRule,
  listFirewallRules,
} from "@studiometa/forge-core";

import { formatFirewallRule, formatFirewallRuleList } from "../formatters.ts";
import { getFirewallRuleHints } from "../hints.ts";
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
  hints: (_data, id, args) => getFirewallRuleHints(String(args.server_id), id),
  formatResult: (action, data, args) => {
    switch (action) {
      case "list":
        return formatFirewallRuleList(data);
      case "get":
        return formatFirewallRule(data);
      case "create":
        return "Done.";
      case "delete":
        return `Firewall rule ${args.id} deleted.`;
      /* v8 ignore next */
      default:
        return "Done.";
    }
  },
});
