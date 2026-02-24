import {
  createSecurityRule,
  deleteSecurityRule,
  getSecurityRule,
  listSecurityRules,
} from "@studiometa/forge-core";

import type { ForgeSecurityRule } from "@studiometa/forge-api";

import { formatSecurityRule, formatSecurityRuleList } from "../formatters.ts";
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
  formatResult: (action, data, args) => {
    switch (action) {
      case "list":
        return formatSecurityRuleList(data as ForgeSecurityRule[]);
      case "get":
        return formatSecurityRule(data as ForgeSecurityRule);
      case "create":
        return formatSecurityRule(data as ForgeSecurityRule);
      case "delete":
        return `Security rule ${args.id} deleted.`;
      default:
        return "Done.";
    }
  },
});
