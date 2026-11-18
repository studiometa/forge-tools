import * as v from "valibot";
import {
  createRedirectRule,
  deleteRedirectRule,
  exportRedirectRules,
  getRedirectRule,
  importRedirectRules,
  listRedirectRules,
  reorderRedirectRules,
} from "@studiometa/forge-core";

import { formatRedirectRule, formatRedirectRuleList } from "../formatters.ts";
import { createResourceHandler } from "./factory.ts";

export const handleRedirectRules = createResourceHandler({
  resource: "redirect-rules",
  actions: ["list", "get", "create", "delete", "export", "import", "reorder"],
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
    export: v.object({ server_id: v.string(), site_id: v.string() }),
    import: v.object({
      server_id: v.string(),
      site_id: v.string(),
      content: v.string(),
      mode: v.picklist(["append", "replace"]),
    }),
    reorder: v.object({
      server_id: v.string(),
      site_id: v.string(),
      redirects: v.array(v.number()),
    }),
  },
  executors: {
    list: listRedirectRules,
    get: getRedirectRule,
    create: createRedirectRule,
    delete: deleteRedirectRule,
    export: exportRedirectRules,
    import: importRedirectRules,
    reorder: reorderRedirectRules,
  },
  mapOptions: (action, args) => {
    const { resource: _r, action: _a, compact: _c, content, ...rest } = args;
    return action === "import" ? { ...rest, csv: content } : rest;
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
      case "export":
        return data as string;
      case "import":
        return `${(data as { imported: number }).imported} redirect rule(s) imported.`;
      case "reorder":
        return `Redirect rules of site ${String(args.site_id)} reordered.`;
      /* v8 ignore next */
      default:
        return "Done.";
    }
  },
});
