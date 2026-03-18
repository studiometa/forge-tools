import type {
  CreateFirewallRuleData,
  HttpClient,
  JsonApiDocument,
  JsonApiListDocument,
  FirewallRuleAttributes,
} from "@studiometa/forge-api";

import { unwrapDocument, unwrapListDocument } from "@studiometa/forge-api";

import { BaseCollection } from "./base.ts";
import { AsyncPaginatedIterator } from "../pagination.ts";

/**
 * Options for listing firewall rules.
 */
export interface FirewallRuleListOptions {
  /** Cursor for pagination (from previous response's next_cursor). */
  cursor?: string;
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
    const query = options.cursor !== undefined ? `?page[cursor]=${options.cursor}` : "";
    const response = await this.client.get<JsonApiListDocument<FirewallRuleAttributes>>(
      `${this.basePath}${query}`,
    );
    return unwrapListDocument(response);
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
  all(): AsyncPaginatedIterator<FirewallRuleAttributes & { id: number }> {
    return new AsyncPaginatedIterator<FirewallRuleAttributes & { id: number }>(async (cursor) => {
      const query = cursor !== null ? `?page[cursor]=${cursor}` : "";
      const response = await this.client.get<JsonApiListDocument<FirewallRuleAttributes>>(
        `${this.basePath}${query}`,
      );
      return {
        items: unwrapListDocument(response),
        nextCursor: response.meta.next_cursor ?? null,
      };
    });
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
   * @example
   * ```ts
   * const rule = await forge.server(123).firewallRules.create({
   *   name: 'Allow HTTP',
   *   port: 80,
   *   type: 'allow',
   * });
   * ```
   */
  async create(data: CreateFirewallRuleData): Promise<FirewallRuleAttributes & { id: number }> {
    const response = await this.client.post<JsonApiDocument<FirewallRuleAttributes>>(
      this.basePath,
      data,
    );
    return unwrapDocument(response);
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
