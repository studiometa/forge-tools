import * as v from "valibot";
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
  inputSchemas: {
    list: v.object({ server_id: v.string() }),
    get: v.object({ server_id: v.string(), id: v.string() }),
    create: v.object({ server_id: v.string(), name: v.string(), port: v.string() }),
    delete: v.object({ server_id: v.string(), id: v.string() }),
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
