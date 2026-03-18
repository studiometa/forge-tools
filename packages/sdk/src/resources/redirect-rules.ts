import type {
  CreateRedirectRuleData,
  HttpClient,
  JsonApiDocument,
  JsonApiListDocument,
  RedirectRuleAttributes,
} from "@studiometa/forge-api";

import { unwrapDocument, unwrapListDocument } from "@studiometa/forge-api";

import { BaseCollection } from "./base.ts";
import { AsyncPaginatedIterator } from "../pagination.ts";

/**
 * Options for listing redirect rules.
 */
export interface RedirectRuleListOptions {
  /** Cursor for pagination (from previous response's next_cursor). */
  cursor?: string;
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
    orgSlug: string,
    private readonly serverId: number,
    private readonly siteId: number,
  ) {
    super(client, orgSlug);
  }

  private get basePath(): string {
    return `/orgs/${this.orgSlug}/servers/${this.serverId}/sites/${this.siteId}/redirect-rules`;
  }

  /**
   * List redirect rules on this site.
   *
   * @example
   * ```ts
   * const rules = await forge.server(123).site(456).redirectRules.list();
   *
   * // Fetch a specific cursor page:
   * const page2 = await forge.server(123).site(456).redirectRules.list({ cursor: 'next-cursor-value' });
   * ```
   */
  async list(
    options: RedirectRuleListOptions = {},
  ): Promise<Array<RedirectRuleAttributes & { id: number }>> {
    const query = options.cursor !== undefined ? `?page[cursor]=${options.cursor}` : "";
    const response = await this.client.get<JsonApiListDocument<RedirectRuleAttributes>>(
      `${this.basePath}${query}`,
    );
    return unwrapListDocument(response);
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
  all(): AsyncPaginatedIterator<RedirectRuleAttributes & { id: number }> {
    return new AsyncPaginatedIterator<RedirectRuleAttributes & { id: number }>(async (cursor) => {
      const query = cursor !== null ? `?page[cursor]=${cursor}` : "";
      const response = await this.client.get<JsonApiListDocument<RedirectRuleAttributes>>(
        `${this.basePath}${query}`,
      );
      return {
        items: unwrapListDocument(response),
        nextCursor: response.meta.next_cursor ?? null,
      };
    });
  }

  /**
   * Get a specific redirect rule.
   *
   * @example
   * ```ts
   * const rule = await forge.server(123).site(456).redirectRules.get(789);
   * ```
   */
  async get(ruleId: number): Promise<RedirectRuleAttributes & { id: number }> {
    const response = await this.client.get<JsonApiDocument<RedirectRuleAttributes>>(
      `${this.basePath}/${ruleId}`,
    );
    return unwrapDocument(response);
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
  async create(data: CreateRedirectRuleData): Promise<RedirectRuleAttributes & { id: number }> {
    const response = await this.client.post<JsonApiDocument<RedirectRuleAttributes>>(
      this.basePath,
      data,
    );
    return unwrapDocument(response);
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
