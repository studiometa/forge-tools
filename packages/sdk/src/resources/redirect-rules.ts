import type {
  CreateRedirectRuleData,
  ForgeRedirectRule,
  HttpClient,
  RedirectRuleResponse,
  RedirectRulesResponse,
} from "@studiometa/forge-api";

import { BaseCollection } from "./base.ts";
import { AsyncPaginatedIterator } from "../pagination.ts";

/**
 * Options for listing redirect rules.
 */
export interface RedirectRuleListOptions {
  /** Page number to fetch (1-indexed). */
  page?: number;
}

/**
 * Collection of redirect rules on a site.
 *
 * Access via `forge.server(id).site(id).redirectRules`.
 *
 * @example
 * ```ts
 * const rules = await forge.server(123).site(456).redirectRules.list();
 * ```
 */
export class RedirectRulesCollection extends BaseCollection {
  /** @internal */
  constructor(
    client: HttpClient,
    private readonly serverId: number,
    private readonly siteId: number,
  ) {
    super(client);
  }

  private get basePath(): string {
    return `/servers/${this.serverId}/sites/${this.siteId}/redirect-rules`;
  }

  /**
   * List redirect rules on this site.
   *
   * @example
   * ```ts
   * const rules = await forge.server(123).site(456).redirectRules.list();
   *
   * // Fetch a specific page:
   * const page2 = await forge.server(123).site(456).redirectRules.list({ page: 2 });
   * ```
   */
  async list(options: RedirectRuleListOptions = {}): Promise<ForgeRedirectRule[]> {
    const query = options.page !== undefined ? `?page=${options.page}` : "";
    const response = await this.client.get<RedirectRulesResponse>(`${this.basePath}${query}`);
    return response.redirect_rules;
  }

  /**
   * Iterate over all redirect rules across all pages.
   *
   * @example
   * ```ts
   * for await (const rule of forge.server(123).site(456).redirectRules.all()) {
   *   console.log(rule);
   * }
   *
   * // Or collect all at once:
   * const rules = await forge.server(123).site(456).redirectRules.all().toArray();
   * ```
   */
  all(
    options: Omit<RedirectRuleListOptions, "page"> = {},
  ): AsyncPaginatedIterator<ForgeRedirectRule> {
    return new AsyncPaginatedIterator<ForgeRedirectRule>((page) => this.list({ ...options, page }));
  }

  /**
   * Get a specific redirect rule.
   *
   * @example
   * ```ts
   * const rule = await forge.server(123).site(456).redirectRules.get(789);
   * ```
   */
  async get(ruleId: number): Promise<ForgeRedirectRule> {
    const response = await this.client.get<RedirectRuleResponse>(`${this.basePath}/${ruleId}`);
    return response.redirect_rule;
  }

  /**
   * Create a new redirect rule.
   *
   * @example
   * ```ts
   * const rule = await forge.server(123).site(456).redirectRules.create({
   *   from: '/old-path',
   *   to: '/new-path',
   *   type: 'redirect',
   * });
   * ```
   */
  async create(data: CreateRedirectRuleData): Promise<ForgeRedirectRule> {
    const response = await this.client.post<RedirectRuleResponse>(this.basePath, data);
    return response.redirect_rule;
  }

  /**
   * Delete a redirect rule.
   *
   * @example
   * ```ts
   * await forge.server(123).site(456).redirectRules.delete(789);
   * ```
   */
  async delete(ruleId: number): Promise<void> {
    await this.client.delete(`${this.basePath}/${ruleId}`);
  }
}
