import type { DomainAttributes } from "@studiometa/forge-api";
import { DomainAttributesSchema } from "@studiometa/forge-api";
import type { ExecutorContext, ExecutorResult } from "../../context.ts";
import { ROUTES } from "../../routes.ts";
import { listAllPages } from "../../utils/list-all-pages.ts";

import type { ListDomainsOptions } from "./types.ts";

/**
 * List the domains of a site, from every page: the primary domain and the aliases.
 */
export async function listDomains(
  options: ListDomainsOptions,
  ctx: ExecutorContext,
): Promise<ExecutorResult<Array<DomainAttributes & { id: number }>>> {
  const { server_id, site_id } = options;
  return {
    data: await listAllPages(
      ROUTES.domains.list,
      ctx,
      { server_id, site_id },
      DomainAttributesSchema,
    ),
  };
}
