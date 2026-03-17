import type {
  CreateSecurityRuleData,
  HttpClient,
  JsonApiDocument,
  JsonApiListDocument,
  SecurityRuleAttributes,
} from "@studiometa/forge-api";

import { unwrapDocument, unwrapListDocument } from "@studiometa/forge-api";

import { BaseCollection } from "./base.ts";
import { AsyncPaginatedIterator } from "../pagination.ts";

/**
 * Options for listing security rules.
 */
export interface SecurityRuleListOptions {
  /** Cursor for pagination (from previous response's next_cursor). */
  cursor?: string;
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
    const query = options.cursor !== undefined ? `?page[cursor]=${options.cursor}` : "";
    const response = await this.client.get<JsonApiListDocument<SecurityRuleAttributes>>(
      `${this.basePath}${query}`,
    );
    return unwrapListDocument(response);
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
  all(): AsyncPaginatedIterator<SecurityRuleAttributes & { id: number }> {
    return new AsyncPaginatedIterator<SecurityRuleAttributes & { id: number }>(async (cursor) => {
      const query = cursor !== null ? `?page[cursor]=${cursor}` : "";
      const response = await this.client.get<JsonApiListDocument<SecurityRuleAttributes>>(
        `${this.basePath}${query}`,
      );
      return {
        items: unwrapListDocument(response),
        nextCursor: response.meta.next_cursor ?? null,
      };
    });
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
}
