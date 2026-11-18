import type { OrganizationAttributes } from "@studiometa/forge-api";

import type { AllOptions, ListOptions } from "../list-options.ts";
import type { AsyncPaginatedIterator } from "../pagination.ts";

import { BaseCollection } from "./base.ts";

/** Options for listing organizations. */
export type OrganizationListOptions = ListOptions;

/**
 * The organizations of the user of the token.
 *
 * Access via `forge.organizations`.
 *
 * @example
 * ```ts
 * const organizations = await forge.organizations.list();
 * ```
 */
export class OrganizationsCollection extends BaseCollection {
  /**
   * List the organizations of the user.
   *
   * @example
   * ```ts
   * const organizations = await forge.organizations.list();
   * ```
   */
  async list(
    options: OrganizationListOptions = {},
  ): Promise<Array<OrganizationAttributes & { id: number }>> {
    return this.listPage<OrganizationAttributes>("/orgs", options);
  }

  /**
   * Iterate over all the organizations of the user.
   *
   * @example
   * ```ts
   * const organizations = await forge.organizations.all().toArray();
   * ```
   */
  all(
    options: AllOptions<OrganizationListOptions> = {},
  ): AsyncPaginatedIterator<OrganizationAttributes & { id: number }> {
    return this.iterate<OrganizationAttributes>("/orgs", options);
  }

  /**
   * Get an organization: the organization of the SDK without a slug.
   *
   * @example
   * ```ts
   * const organization = await forge.organizations.get();
   * ```
   */
  async get(slug: string = this.orgSlug): Promise<OrganizationAttributes & { id: number }> {
    return this.getResource<OrganizationAttributes>(`/orgs/${slug}`);
  }
}
