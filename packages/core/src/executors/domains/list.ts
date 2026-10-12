import type { DomainAttributes } from "@studiometa/forge-api";
import { DomainAttributesSchema } from "@studiometa/forge-api";

import type { ExecutorContext, ExecutorResult } from "../../context.ts";
import { ROUTES } from "../../routes.ts";
import { listAllPages } from "../../utils/list-all-pages.ts";
import { matchByName } from "../../utils/name-matcher.ts";

import type { ListDomainsOptions } from "./types.ts";

type Domain = DomainAttributes & { id: number };

/**
 * List the domains (primary and aliases) of a site, from every page.
 */
export async function listDomains(
  options: ListDomainsOptions,
  ctx: ExecutorContext,
): Promise<ExecutorResult<Domain[]>> {
  return {
    data: await listAllPages(
      ROUTES.domains.list,
      ctx,
      { server_id: options.server_id, site_id: options.site_id },
      DomainAttributesSchema,
    ),
  };
}

/**
 * Format domains as "name (id)" items for error messages.
 */
function describeDomains(domains: Domain[]): string {
  return domains.map((item) => `${item.name} (${item.id})`).join(", ") || "none";
}

/**
 * Resolve a domain to its domain record ID on a site.
 *
 * A numeric value is an ID and is returned as is, without an API call.
 * Any other value is a domain name: a single exact match (case-insensitive) wins,
 * else a single partial match is used.
 * Throws when no domain or more than one domain matches.
 */
export async function resolveDomainId(
  server_id: string,
  site_id: string,
  domain: string,
  ctx: ExecutorContext,
): Promise<string> {
  if (/^\d+$/.test(domain)) {
    return domain;
  }

  const { data: domains } = await listDomains({ server_id, site_id }, ctx);
  const { exact, partial } = matchByName(domains, domain.trim(), (item) => item.name);
  const matches = exact.length === 1 ? exact : partial;

  if (matches.length === 1) {
    return String(matches[0].id);
  }

  if (matches.length === 0) {
    throw new Error(
      `No domain matching "${domain}" on site ${site_id}. Domains: ${describeDomains(domains)}.`,
    );
  }

  throw new Error(
    `Ambiguous domain "${domain}" on site ${site_id}: ${describeDomains(matches)}. Use the full name or the domain ID.`,
  );
}
