import { createSite, deleteSite, getSite, listSites } from "@studiometa/forge-core";

import type { ForgeSite } from "@studiometa/forge-api";

import { formatSite, formatSiteList } from "../formatters.ts";
import { getSiteHints } from "../hints.ts";
import { handleSiteContext } from "./context.ts";
import { createResourceHandler } from "./factory.ts";
import type { CommonArgs, HandlerContext, ToolResult } from "./types.ts";

const _handleSites = createResourceHandler({
  resource: "sites",
  actions: ["list", "get", "create", "delete"],
  requiredFields: {
    list: ["server_id"],
    get: ["server_id", "id"],
    create: ["server_id", "domain"],
    delete: ["server_id", "id"],
  },
  executors: {
    list: listSites,
    get: getSite,
    create: createSite,
    delete: deleteSite,
  },
  hints: (data, id) => {
    const site = data as ForgeSite;
    return getSiteHints(String(site.server_id), id);
  },
  mapOptions: (action, args) => {
    switch (action) {
      case "list":
        return { server_id: args.server_id };
      case "get":
        return { server_id: args.server_id, site_id: args.id };
      case "create":
        return {
          server_id: args.server_id,
          domain: args.domain,
          project_type: args.project_type ?? "php",
          directory: args.directory,
        };
      case "delete":
        return { server_id: args.server_id, site_id: args.id };
      /* v8 ignore next */
      default:
        return {};
    }
  },
  formatResult: (action, data, args) => {
    switch (action) {
      case "list":
        return formatSiteList(data as ForgeSite[], args.server_id as string | undefined);
      case "get":
        return formatSite(data as ForgeSite);
      case "create":
        return formatSite(data as ForgeSite);
      case "delete":
        return `Site ${args.id} deleted from server ${args.server_id}.`;
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
