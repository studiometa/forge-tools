import * as v from "valibot";
import {
  createRedirectRule,
  deleteRedirectRule,
  getRedirectRule,
  listRedirectRules,
} from "@studiometa/forge-core";

import { formatRedirectRule, formatRedirectRuleList } from "../formatters.ts";
import { createResourceHandler } from "./factory.ts";

export const handleRedirectRules = createResourceHandler({
  resource: "redirect-rules",
  actions: ["list", "get", "create", "delete"],
  inputSchemas: {
    list: v.object({ server_id: v.string(), site_id: v.string() }),
    get: v.object({ server_id: v.string(), site_id: v.string(), id: v.string() }),
    create: v.object({
      server_id: v.string(),
      site_id: v.string(),
      from: v.string(),
      to: v.string(),
    }),
    delete: v.object({ server_id: v.string(), site_id: v.string(), id: v.string() }),
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
        return formatRedirectRuleList(data);
      case "get":
        return formatRedirectRule(data);
      case "create":
        return "Done.";
      case "delete":
        return `Redirect rule ${args.id} deleted.`;
      /* v8 ignore next */
      default:
        return "Done.";
    }
  },
});
