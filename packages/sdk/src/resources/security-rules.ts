import type {
  CreateSecurityRuleData,
  ForgeSecurityRule,
  HttpClient,
  SecurityRuleResponse,
  SecurityRulesResponse,
} from "@studiometa/forge-api";

import { BaseCollection } from "./base.ts";
import { AsyncPaginatedIterator } from "../pagination.ts";

/**
 * Options for listing security rules.
 */
export interface SecurityRuleListOptions {
  /** Page number to fetch (1-indexed). */
  page?: number;
}

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
    private readonly serverId: number,
    private readonly siteId: number,
  ) {
    super(client);
  }

  private get basePath(): string {
    return `/servers/${this.serverId}/sites/${this.siteId}/security-rules`;
  }

  /**
   * List security rules on this site.
   *
   * @example
   * ```ts
   * const rules = await forge.server(123).site(456).securityRules.list();
   *
   * // Fetch a specific page:
   * const page2 = await forge.server(123).site(456).securityRules.list({ page: 2 });
   * ```
   */
  async list(options: SecurityRuleListOptions = {}): Promise<ForgeSecurityRule[]> {
    const query = options.page !== undefined ? `?page=${options.page}` : "";
    const response = await this.client.get<SecurityRulesResponse>(`${this.basePath}${query}`);
    return response.security_rules;
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
    options: Omit<SecurityRuleListOptions, "page"> = {},
  ): AsyncPaginatedIterator<ForgeSecurityRule> {
    return new AsyncPaginatedIterator<ForgeSecurityRule>((page) => this.list({ ...options, page }));
  }

  /**
   * Get a specific security rule.
   *
   * @example
   * ```ts
   * const rule = await forge.server(123).site(456).securityRules.get(789);
   * ```
   */
  async get(ruleId: number): Promise<ForgeSecurityRule> {
    const response = await this.client.get<SecurityRuleResponse>(`${this.basePath}/${ruleId}`);
    return response.security_rule;
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
  async create(data: CreateSecurityRuleData): Promise<ForgeSecurityRule> {
    const response = await this.client.post<SecurityRuleResponse>(this.basePath, data);
    return response.security_rule;
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
}
