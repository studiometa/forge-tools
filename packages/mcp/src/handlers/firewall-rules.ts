import {
  createFirewallRule,
  deleteFirewallRule,
  getFirewallRule,
  listFirewallRules,
} from "@studiometa/forge-core";

import type { ForgeFirewallRule } from "@studiometa/forge-api";

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
  hints: (data, id) => {
    const rule = data as ForgeFirewallRule;
    return getFirewallRuleHints(String(rule.server_id), id);
  },
  formatResult: (action, data, args) => {
    switch (action) {
      case "list":
        return formatFirewallRuleList(data as ForgeFirewallRule[]);
      case "get":
        return formatFirewallRule(data as ForgeFirewallRule);
      case "create":
        return formatFirewallRule(data as ForgeFirewallRule);
      case "delete":
        return `Firewall rule ${args.id} deleted.`;
      /* v8 ignore next */
      default:
        return "Done.";
    }
  },
});
