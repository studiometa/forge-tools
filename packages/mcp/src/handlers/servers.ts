import {
  createServer,
  deleteServer,
  getServer,
  listServers,
  rebootServer,
  resolveServers,
} from "@studiometa/forge-core";

import type { ForgeServer } from "@studiometa/forge-api";
import type { ResolveResult } from "@studiometa/forge-core";

import { formatServer, formatServerList } from "../formatters.ts";
import { getServerHints } from "../hints.ts";
import { handleServerContext } from "./context.ts";
import { createResourceHandler } from "./factory.ts";
import type { CommonArgs, HandlerContext, ToolResult } from "./types.ts";

const _handleServers = createResourceHandler({
  resource: "servers",
  actions: ["list", "get", "create", "delete", "reboot", "resolve"],
  requiredFields: {
    get: ["id"],
    create: ["provider", "name", "type", "region"],
    delete: ["id"],
    reboot: ["id"],
    resolve: ["query"],
  },
  executors: {
    list: listServers,
    get: getServer,
    create: createServer,
    delete: deleteServer,
    reboot: rebootServer,
    resolve: resolveServers,
  },
  hints: (_data, id) => getServerHints(id),
  mapOptions: (action, args) => {
    switch (action) {
      case "get":
      case "delete":
      case "reboot":
        return { server_id: args.id };
      case "create":
        return {
          provider: args.provider,
          /* v8 ignore next */
          credential_id: Number(args.credential_id) || 0,
          name: args.name,
          /* v8 ignore next */
          type: args.type ?? "app",
          /* v8 ignore next */
          size: args.size ?? "",
          region: args.region,
        };
      case "resolve":
        return { query: args.query };
      default:
        return {};
    }
  },
  formatResult: (action, data, args) => {
    switch (action) {
      case "list":
        return formatServerList(data as ForgeServer[]);
      case "get":
        return formatServer(data as ForgeServer);
      case "create":
        return formatServer(data as ForgeServer);
      case "delete":
        return `Server ${args.id} deleted.`;
      case "reboot":
        return `Server ${args.id} reboot initiated.`;
      case "resolve": {
        const result = data as ResolveResult;
        if (result.total === 0) return `No servers matching "${result.query}".`;
        const lines = result.matches.map((m) => `• ${m.name} (ID: ${m.id})`);
        return `${result.total} server(s) matching "${result.query}":\n${lines.join("\n")}`;
      }
      /* v8 ignore next */
      default:
        return "Done.";
    }
  },
});

/**
 * Handle servers resource actions, intercepting the `context` action
 * for rich single-call resource fetching.
 */
export async function handleServers(
  action: string,
  args: CommonArgs,
  ctx: HandlerContext,
): Promise<ToolResult> {
  if (action === "context") {
    return handleServerContext(args, ctx);
  }
  return _handleServers(action, args, ctx);
}
