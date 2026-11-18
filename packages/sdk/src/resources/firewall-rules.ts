import type {
  CreateFirewallRuleData,
  HttpClient,
  JsonApiDocument,
  FirewallRuleAttributes,
} from "@studiometa/forge-api";

import { unwrapDocument } from "@studiometa/forge-api";

import type { AllOptions, ListOptions } from "../list-options.ts";

import { BaseCollection } from "./base.ts";
import { AsyncPaginatedIterator } from "../pagination.ts";

/**
 * Options for listing firewall rules.
 */
export type FirewallRuleListOptions = ListOptions<
  "name" | "status" | "ip_address" | "type" | "port",
  "created_at" | "updated_at"
>;

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
    orgSlug: string,
    private readonly serverId: number,
  ) {
    super(client, orgSlug);
  }

  private get basePath(): string {
    return `/orgs/${this.orgSlug}/servers/${this.serverId}/firewall-rules`;
  }

  /**
   * List firewall rules on this server.
   *
   * @example
   * ```ts
   * const rules = await forge.server(123).firewallRules.list();
   *
   * // Fetch a specific cursor page:
   * const page2 = await forge.server(123).firewallRules.list({ cursor: 'next-cursor-value' });
   * ```
   */
  async list(
    options: FirewallRuleListOptions = {},
  ): Promise<Array<FirewallRuleAttributes & { id: number }>> {
    return this.listPage<FirewallRuleAttributes>(this.basePath, options);
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
    options: AllOptions<FirewallRuleListOptions> = {},
  ): AsyncPaginatedIterator<FirewallRuleAttributes & { id: number }> {
    return this.iterate<FirewallRuleAttributes>(this.basePath, options);
  }

  /**
   * Get a specific firewall rule.
   *
   * @example
   * ```ts
   * const rule = await forge.server(123).firewallRules.get(789);
   * ```
   */
  async get(ruleId: number): Promise<FirewallRuleAttributes & { id: number }> {
    const response = await this.client.get<JsonApiDocument<FirewallRuleAttributes>>(
      `${this.basePath}/${ruleId}`,
    );
    return unwrapDocument(response);
  }

  /**
   * Create a new firewall rule.
   *
   * Forge answers `202 Accepted` without a body: the rule is installed in the background.
   *
   * @example
   * ```ts
   * await forge.server(123).firewallRules.create({
   *   name: 'Allow HTTP',
   *   port: 80,
   *   type: 'allow',
   * });
   * ```
   */
  async create(data: CreateFirewallRuleData): Promise<void> {
    await this.client.post(this.basePath, data);
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
