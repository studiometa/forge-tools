import * as v from "valibot";
import type { DriftResult, EnvDiff, ExecutorContext, ExecutorResult } from "@studiometa/forge-core";
import { compareEnv, getEnv, updateEnv } from "@studiometa/forge-core";

import { formatDrift, formatEnv } from "../formatters.ts";
import { createResourceHandler } from "./factory.ts";
import { contentSchema } from "./utils.ts";

/**
 * Compare a local .env file with the one on Forge, by variable name.
 * The result holds names only, never values.
 */
async function checkEnv(
  options: { server_id: string; site_id: string; content: string },
  ctx: ExecutorContext,
): Promise<ExecutorResult<DriftResult<EnvDiff>>> {
  const remote = await getEnv({ server_id: options.server_id, site_id: options.site_id }, ctx);
  return { data: compareEnv(remote.data, options.content) };
}

export const handleEnv = createResourceHandler({
  resource: "env",
  actions: ["get", "update", "check"],
  inputSchemas: {
    get: v.object({ server_id: v.string(), site_id: v.string() }),
    update: v.object({ server_id: v.string(), site_id: v.string(), content: v.string() }),
    check: v.object({ server_id: v.string(), site_id: v.string(), content: contentSchema }),
  },
  executors: {
    get: getEnv,
    update: updateEnv,
    check: checkEnv,
  },
  mapOptions: (_action, args) => ({
    server_id: args.server_id,
    site_id: args.site_id,
    content: args.content,
  }),
  formatResult: (action, data) => {
    switch (action) {
      case "get":
        return formatEnv(data as string);
      case "update":
        return "Environment variables updated.";
      case "check":
        return formatDrift("environment file", data as DriftResult<EnvDiff>);
      /* v8 ignore next */
      default:
        return "Done.";
    }
  },
});
