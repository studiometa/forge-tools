import type { SiteAttributes } from "@studiometa/forge-api";

import type { AllOptions, ListOptions } from "../list-options.ts";
import type { AsyncPaginatedIterator } from "../pagination.ts";

import { BaseCollection } from "./base.ts";

/** The relationships that a list of sites can include. */
export type SiteInclude =
  | "server"
  | "serverCount"
  | "serverExists"
  | "tags"
  | "tagsCount"
  | "tagsExists"
  | "latestDeployment"
  | "latestDeploymentCount"
  | "latestDeploymentExists"
  | "securityRules"
  | "securityRulesCount"
  | "securityRulesExists"
  | "redirectRules"
  | "redirectRulesCount"
  | "redirectRulesExists";

/** Options for listing the sites of the organization. */
export type OrganizationSiteListOptions = ListOptions<"name", never, SiteInclude>;

/**
 * The sites of every server of the organization.
 *
 * Access via `forge.sites`. Use `forge.server(id).sites` for the sites of one server.
 *
 * @example
 * ```ts
 * const sites = await forge.sites.list({ filter: { name: 'example.com' } });
 * ```
 */
export class OrganizationSitesCollection extends BaseCollection {
  /** @internal */
  private get basePath(): string {
    return `/orgs/${this.orgSlug}/sites`;
  }

  /**
   * List the sites of the organization.
   *
   * @example
   * ```ts
   * const sites = await forge.sites.list();
   * ```
   */
  async list(
    options: OrganizationSiteListOptions = {},
  ): Promise<Array<SiteAttributes & { id: number }>> {
    return this.listPage<SiteAttributes>(this.basePath, options);
  }

  /**
   * Iterate over all the sites of the organization.
   *
   * @example
   * ```ts
   * const sites = await forge.sites.all().toArray();
   * ```
   */
  all(
    options: AllOptions<OrganizationSiteListOptions> = {},
  ): AsyncPaginatedIterator<SiteAttributes & { id: number }> {
    return this.iterate<SiteAttributes>(this.basePath, options);
  }

  /**
   * Get a site by ID, without its server ID.
   *
   * @example
   * ```ts
   * const site = await forge.sites.get(456);
   * ```
   */
  async get(siteId: number): Promise<SiteAttributes & { id: number }> {
    return this.getResource<SiteAttributes>(`${this.basePath}/${siteId}`);
  }
}
