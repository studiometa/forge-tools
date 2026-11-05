import type { ScheduledJobAttributes } from "@studiometa/forge-api";
import { ScheduledJobAttributesSchema } from "@studiometa/forge-api";
import type { ExecutorContext, ExecutorResult } from "../../context.ts";
import { ROUTES } from "../../routes.ts";
import { listAllPages } from "../../utils/list-all-pages.ts";

import type { ListScheduledJobsOptions } from "./types.ts";

/**
 * List scheduled jobs on a server, or of one site with `site_id`, from every page.
 */
export async function listScheduledJobs(
  options: ListScheduledJobsOptions,
  ctx: ExecutorContext,
): Promise<ExecutorResult<Array<ScheduledJobAttributes & { id: number }>>> {
  const route = options.site_id ? ROUTES.scheduledJobs.siteList : ROUTES.scheduledJobs.list;
  const params: Record<string, string> = { server_id: options.server_id };
  if (options.site_id) params.site_id = options.site_id;

  return {
    data: await listAllPages(route, ctx, params, ScheduledJobAttributesSchema),
  };
}
