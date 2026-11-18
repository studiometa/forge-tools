import type { SiteAttributes } from "@studiometa/forge-api";
import { unwrapDocument, jsonApiDocumentSchema, SiteAttributesSchema } from "@studiometa/forge-api";

import type { ExecutorContext, ExecutorResult } from "../../context.ts";
import { ROUTES, request } from "../../routes.ts";

import type { UpdateSiteGitOptions } from "./types.ts";

/**
 * Change the source control provider, repository or branch that a site deploys from.
 */
export async function updateSiteGit(
  options: UpdateSiteGitOptions,
  ctx: ExecutorContext,
): Promise<ExecutorResult<SiteAttributes & { id: number }>> {
  const { server_id, site_id, ...data } = options;
  const response = await request(
    ROUTES.sites.updateGit,
    ctx,
    { server_id, site_id },
    { body: data, schema: jsonApiDocumentSchema(SiteAttributesSchema) },
  );

  return {
    data: unwrapDocument(response),
  };
}
