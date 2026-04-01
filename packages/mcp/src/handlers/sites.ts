import * as v from "valibot";
import {
  createSite,
  deleteSite,
  getSite,
  listSites,
  resolveSites,
  updateSite,
} from "@studiometa/forge-core";

import type { ResolveSiteResult } from "@studiometa/forge-core";

import { formatSite, formatSiteList } from "../formatters.ts";
import { getSiteHints } from "../hints.ts";
import { handleSiteContext } from "./context.ts";
import { createResourceHandler } from "./factory.ts";
import type { CommonArgs, HandlerContext, ToolResult } from "./types.ts";

const _handleSites = createResourceHandler({
  resource: "sites",
  actions: ["list", "get", "create", "update", "delete", "resolve"],
  inputSchemas: {
    list: v.object({ server_id: v.string() }),
    get: v.object({ server_id: v.string(), id: v.string() }),
    create: v.object({ server_id: v.string(), type: v.string() }),
    update: v.object({ server_id: v.string(), id: v.string() }),
    delete: v.object({ server_id: v.string(), id: v.string() }),
    resolve: v.object({ server_id: v.string(), query: v.string() }),
  },
  executors: {
    list: listSites,
    get: getSite,
    create: createSite,
    update: updateSite,
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
      case "update":
        return {
          server_id: args.server_id,
          site_id: args.id,
          root_path: args.root_path,
          directory: args.directory,
          type: args.type,
          php_version: args.php_version,
          push_to_deploy: args.push_to_deploy,
          repository_branch: args.repository_branch,
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
        return formatSiteList(data, args.server_id);
      case "get":
        return formatSite(data);
      case "create":
        return formatSite(data);
      case "update":
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
