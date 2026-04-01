import * as v from "valibot";
import {
  createSecurityRule,
  deleteSecurityRule,
  getSecurityRule,
  listSecurityRules,
  updateSecurityRule,
} from "@studiometa/forge-core";

import { formatSecurityRule, formatSecurityRuleList } from "../formatters.ts";
import { createResourceHandler } from "./factory.ts";

export const handleSecurityRules = createResourceHandler({
  resource: "security-rules",
  actions: ["list", "get", "create", "update", "delete"],
  inputSchemas: {
    list: v.object({ server_id: v.string(), site_id: v.string() }),
    get: v.object({ server_id: v.string(), site_id: v.string(), id: v.string() }),
    create: v.object({
      server_id: v.string(),
      site_id: v.string(),
      name: v.string(),
      credentials: v.unknown(),
    }),
    update: v.object({
      server_id: v.string(),
      site_id: v.string(),
      id: v.string(),
      name: v.string(),
      path: v.optional(v.nullable(v.string())),
      credentials: v.unknown(),
    }),
    delete: v.object({ server_id: v.string(), site_id: v.string(), id: v.string() }),
  },
  executors: {
    list: listSecurityRules,
    get: getSecurityRule,
    create: createSecurityRule,
    update: updateSecurityRule,
    delete: deleteSecurityRule,
  },
  formatResult: (action, data, args) => {
    switch (action) {
      case "list":
        return formatSecurityRuleList(data);
      case "get":
        return formatSecurityRule(data);
      case "create":
        return formatSecurityRule(data);
      case "update":
        return formatSecurityRule(data);
      case "delete":
        return `Security rule ${args.id} deleted.`;
      /* v8 ignore next */
      default:
        return "Done.";
    }
  },
});
