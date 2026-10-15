import * as v from "valibot";
import type { DriftResult, ExecutorContext, ExecutorResult } from "@studiometa/forge-core";
import { compareText, getNginxConfig, updateNginxConfig } from "@studiometa/forge-core";

import { formatDrift, formatNginxConfig } from "../formatters.ts";
import { createResourceHandler } from "./factory.ts";
import { contentSchema } from "./utils.ts";

/**
 * Compare a local nginx configuration with the one on Forge, as a unified line diff.
 */
async function checkNginxConfig(
  options: { server_id: string; site_id: string; content: string },
  ctx: ExecutorContext,
): Promise<ExecutorResult<DriftResult<string>>> {
  const remote = await getNginxConfig(
    { server_id: options.server_id, site_id: options.site_id },
    ctx,
  );
  return { data: compareText(remote.data, options.content) };
}

export const handleNginxConfig = createResourceHandler({
  resource: "nginx",
  actions: ["get", "update", "check"],
  inputSchemas: {
    get: v.object({ server_id: v.string(), site_id: v.string() }),
    update: v.object({ server_id: v.string(), site_id: v.string(), content: v.string() }),
    check: v.object({ server_id: v.string(), site_id: v.string(), content: contentSchema }),
  },
  executors: {
    get: getNginxConfig,
    update: updateNginxConfig,
    check: checkNginxConfig,
  },
  mapOptions: (_action, args) => ({
    server_id: args.server_id,
    site_id: args.site_id,
    content: args.content,
  }),
  formatResult: (action, data) => {
    switch (action) {
      case "get":
        return formatNginxConfig(data as string);
      case "update":
        return "Nginx configuration updated.";
      case "check":
        return formatDrift("nginx configuration", data as DriftResult<string>);
      /* v8 ignore next */
      default:
        return "Done.";
    }
  },
});
