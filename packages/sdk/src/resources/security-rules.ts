import type {
  CreateSecurityRuleData,
  HttpClient,
  JsonApiDocument,
  SecurityRuleAttributes,
  UpdateSecurityRuleData,
} from "@studiometa/forge-api";

import { unwrapDocument } from "@studiometa/forge-api";

import type { AllOptions, ListOptions } from "../list-options.ts";

import { BaseCollection } from "./base.ts";
import { AsyncPaginatedIterator } from "../pagination.ts";

/**
 * Options for listing security rules.
 */
export type SecurityRuleListOptions = ListOptions<
  "path" | "status",
  "path" | "status" | "created_at" | "updated_at"
>;

/**
 * Collection of security rules on a site.
 *
 * Access via `forge.server(id).site(id).securityRules`.
 *
 * @example
 * ```ts
 * const rules = await forge.server(123).site(456).securityRules.list();
 * ```
 */
export class SecurityRulesCollection extends BaseCollection {
  /** @internal */
  constructor(
    client: HttpClient,
    orgSlug: string,
    private readonly serverId: number,
    private readonly siteId: number,
  ) {
    super(client, orgSlug);
  }

  private get basePath(): string {
    return `/orgs/${this.orgSlug}/servers/${this.serverId}/sites/${this.siteId}/security-rules`;
  }

  /**
   * List security rules on this site.
   *
   * @example
   * ```ts
   * const rules = await forge.server(123).site(456).securityRules.list();
   *
   * // Fetch a specific cursor page:
   * const page2 = await forge.server(123).site(456).securityRules.list({ cursor: 'next-cursor-value' });
   * ```
   */
  async list(
    options: SecurityRuleListOptions = {},
  ): Promise<Array<SecurityRuleAttributes & { id: number }>> {
    return this.listPage<SecurityRuleAttributes>(this.basePath, options);
  }

  /**
   * Iterate over all security rules across all pages.
   *
   * @example
   * ```ts
   * for await (const rule of forge.server(123).site(456).securityRules.all()) {
   *   console.log(rule);
   * }
   *
   * // Or collect all at once:
   * const rules = await forge.server(123).site(456).securityRules.all().toArray();
   * ```
   */
  all(
    options: AllOptions<SecurityRuleListOptions> = {},
  ): AsyncPaginatedIterator<SecurityRuleAttributes & { id: number }> {
    return this.iterate<SecurityRuleAttributes>(this.basePath, options);
  }

  /**
   * Get a specific security rule.
   *
   * @example
   * ```ts
   * const rule = await forge.server(123).site(456).securityRules.get(789);
   * ```
   */
  async get(ruleId: number): Promise<SecurityRuleAttributes & { id: number }> {
    const response = await this.client.get<JsonApiDocument<SecurityRuleAttributes>>(
      `${this.basePath}/${ruleId}`,
    );
    return unwrapDocument(response);
  }

  /**
   * Create a new security rule.
   *
   * @example
   * ```ts
   * const rule = await forge.server(123).site(456).securityRules.create({
   *   name: 'Admin Area',
   *   path: '/admin',
   *   credentials: [{ username: 'admin', password: 'secret' }],
   * });
   * ```
   */
  async create(data: CreateSecurityRuleData): Promise<SecurityRuleAttributes & { id: number }> {
    const response = await this.client.post<JsonApiDocument<SecurityRuleAttributes>>(
      this.basePath,
      data,
    );
    return unwrapDocument(response);
  }

  /**
   * Delete a security rule.
   *
   * @example
   * ```ts
   * await forge.server(123).site(456).securityRules.delete(789);
   * ```
   */
  async delete(ruleId: number): Promise<void> {
    await this.client.delete(`${this.basePath}/${ruleId}`);
  }

  /**
   * Update a security rule.
   *
   * @example
   * ```ts
   * await forge.server(123).site(456).securityRules.update(789, { name: 'Admin' });
   * ```
   */
  async update(ruleId: number, data: UpdateSecurityRuleData): Promise<void> {
    await this.client.put(`${this.basePath}/${ruleId}`, data);
  }
}
