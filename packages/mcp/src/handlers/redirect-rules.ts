import {
  createRedirectRule,
  deleteRedirectRule,
  getRedirectRule,
  listRedirectRules,
} from "@studiometa/forge-core";

import type { ForgeRedirectRule } from "@studiometa/forge-api";

import { formatRedirectRule, formatRedirectRuleList } from "../formatters.ts";
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
  formatResult: (action, data, args) => {
    switch (action) {
      case "list":
        return formatRedirectRuleList(data as ForgeRedirectRule[]);
      case "get":
        return formatRedirectRule(data as ForgeRedirectRule);
      case "create":
        return formatRedirectRule(data as ForgeRedirectRule);
      case "delete":
        return `Redirect rule ${args.id} deleted.`;
      /* v8 ignore next */
      default:
        return "Done.";
    }
  },
});
