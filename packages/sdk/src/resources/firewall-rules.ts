import type {
  CreateFirewallRuleData,
  FirewallRuleResponse,
  FirewallRulesResponse,
  ForgeFirewallRule,
  HttpClient,
} from "@studiometa/forge-api";

import { BaseCollection } from "./base.ts";
import { AsyncPaginatedIterator } from "../pagination.ts";

/**
 * Options for listing firewall rules.
 */
export interface FirewallRuleListOptions {
  /** Page number to fetch (1-indexed). */
  page?: number;
}

/**
 * Collection of firewall rules on a server.
 *
 * Access via `forge.server(id).firewallRules`.
 *
 * @example
 * ```ts
 * const rules = await forge.server(123).firewallRules.list();
 * ```
 */
export class FirewallRulesCollection extends BaseCollection {
  /** @internal */
  constructor(
    client: HttpClient,
    private readonly serverId: number,
  ) {
    super(client);
  }

  private get basePath(): string {
    return `/servers/${this.serverId}/firewall-rules`;
  }

  /**
   * List firewall rules on this server.
   *
   * @example
   * ```ts
   * const rules = await forge.server(123).firewallRules.list();
   *
   * // Fetch a specific page:
   * const page2 = await forge.server(123).firewallRules.list({ page: 2 });
   * ```
   */
  async list(options: FirewallRuleListOptions = {}): Promise<ForgeFirewallRule[]> {
    const query = options.page !== undefined ? `?page=${options.page}` : "";
    const response = await this.client.get<FirewallRulesResponse>(`${this.basePath}${query}`);
    return response.rules;
  }

  /**
   * Iterate over all firewall rules across all pages.
   *
   * @example
   * ```ts
   * for await (const rule of forge.server(123).firewallRules.all()) {
   *   console.log(rule);
   * }
   *
   * // Or collect all at once:
   * const rules = await forge.server(123).firewallRules.all().toArray();
   * ```
   */
  all(
    options: Omit<FirewallRuleListOptions, "page"> = {},
  ): AsyncPaginatedIterator<ForgeFirewallRule> {
    return new AsyncPaginatedIterator<ForgeFirewallRule>((page) => this.list({ ...options, page }));
  }

  /**
   * Get a specific firewall rule.
   *
   * @example
   * ```ts
   * const rule = await forge.server(123).firewallRules.get(789);
   * ```
   */
  async get(ruleId: number): Promise<ForgeFirewallRule> {
    const response = await this.client.get<FirewallRuleResponse>(`${this.basePath}/${ruleId}`);
    return response.rule;
  }

  /**
   * Create a new firewall rule.
   *
   * @example
   * ```ts
   * const rule = await forge.server(123).firewallRules.create({
   *   name: 'Allow HTTP',
   *   port: 80,
   *   type: 'allow',
   * });
   * ```
   */
  async create(data: CreateFirewallRuleData): Promise<ForgeFirewallRule> {
    const response = await this.client.post<FirewallRuleResponse>(this.basePath, data);
    return response.rule;
  }

  /**
   * Delete a firewall rule.
   *
   * @example
   * ```ts
   * await forge.server(123).firewallRules.delete(789);
   * ```
   */
  async delete(ruleId: number): Promise<void> {
    await this.client.delete(`${this.basePath}/${ruleId}`);
  }
}
