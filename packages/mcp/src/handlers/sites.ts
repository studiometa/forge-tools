import { createSite, deleteSite, getSite, listSites, resolveSites } from "@studiometa/forge-core";

import type { ResolveSiteResult } from "@studiometa/forge-core";

import { formatSite, formatSiteList } from "../formatters.ts";
import { getSiteHints } from "../hints.ts";
import { handleSiteContext } from "./context.ts";
import { createResourceHandler } from "./factory.ts";
import type { CommonArgs, HandlerContext, ToolResult } from "./types.ts";

const _handleSites = createResourceHandler({
  resource: "sites",
  actions: ["list", "get", "create", "delete", "resolve"],
  requiredFields: {
    list: ["server_id"],
    get: ["server_id", "id"],
    create: ["server_id", "type"],
    delete: ["server_id", "id"],
    resolve: ["server_id", "query"],
  },
  executors: {
    list: listSites,
    get: getSite,
    create: createSite,
    delete: deleteSite,
    resolve: resolveSites,
  },
  hints: (_data, id, args) => getSiteHints(String(args.server_id), id),
  mapOptions: (action, args) => {
    switch (action) {
      case "list":
        return { server_id: args.server_id };
      case "get":
        return { server_id: args.server_id, site_id: args.id };
      case "create":
        return {
          server_id: args.server_id,
          type: args.type ?? "php",
          name: args.name ?? args.domain,
          web_directory: args.web_directory ?? args.directory,
        };
      case "delete":
        return { server_id: args.server_id, site_id: args.id };
      case "resolve":
        return { server_id: args.server_id, query: args.query };
      /* v8 ignore next */
      default:
        return {};
    }
  },
  formatResult: (action, data, args) => {
    switch (action) {
      case "list":
        return formatSiteList(data, args.server_id as string | undefined);
      case "get":
        return formatSite(data);
      case "create":
        return formatSite(data);
      case "delete":
        return `Site ${args.id} deleted from server ${args.server_id}.`;
      case "resolve": {
        const result = data as ResolveSiteResult;
        if (result.total === 0)
          return `No sites matching "${result.query}" on server ${args.server_id}.`;
        const lines = result.matches.map((m) => `• ${m.name} (ID: ${m.id})`);
        return `${result.total} site(s) matching "${result.query}" on server ${args.server_id}:\n${lines.join("\n")}`;
      }
      /* v8 ignore next */
      default:
        return "Done.";
    }
  },
});

/**
 * Handle sites resource actions, intercepting the `context` action
 * for rich single-call resource fetching.
 */
export async function handleSites(
  action: string,
  args: CommonArgs,
  ctx: HandlerContext,
): Promise<ToolResult> {
  if (action === "context") {
    return handleSiteContext(args, ctx);
  }
  return _handleSites(action, args, ctx);
}
