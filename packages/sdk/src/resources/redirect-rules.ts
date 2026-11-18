import type {
  CreateRedirectRuleData,
  HttpClient,
  JsonApiDocument,
  RedirectRuleAttributes,
} from "@studiometa/forge-api";

import { unwrapDocument } from "@studiometa/forge-api";

import type { AllOptions, ListOptions } from "../list-options.ts";

import { BaseCollection } from "./base.ts";
import { AsyncPaginatedIterator } from "../pagination.ts";

/** How an import applies its rules: after the current rules, or instead of them. */
export type RedirectRuleImportMode = "append" | "replace";

/**
 * Options for listing redirect rules.
 */
export type RedirectRuleListOptions = ListOptions<
  "from" | "to" | "type" | "status",
  "created_at" | "updated_at"
>;

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
    return this.listPage<RedirectRuleAttributes>(this.basePath, options);
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
    options: AllOptions<RedirectRuleListOptions> = {},
  ): AsyncPaginatedIterator<RedirectRuleAttributes & { id: number }> {
    return this.iterate<RedirectRuleAttributes>(this.basePath, options);
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
   * Forge answers `202 Accepted` without a body: the rule is installed in the background.
   *
   * @example
   * ```ts
   * await forge.server(123).site(456).redirectRules.create({
   *   from: '/old-path',
   *   to: '/new-path',
   *   type: 'redirect',
   * });
   * ```
   */
  async create(data: CreateRedirectRuleData): Promise<void> {
    await this.client.post(this.basePath, data);
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

  /**
   * Export the redirect rules of the site as CSV, with a `from,to,type` header row.
   *
   * @example
   * ```ts
   * const csv = await forge.server(123).site(456).redirectRules.export();
   * ```
   */
  async export(): Promise<string> {
    return this.client.get<string>(`${this.basePath}/export`);
  }

  /**
   * Import redirect rules from CSV, with a `from,to,type` header row. Returns the number of
   * imported rules.
   *
   * @example
   * ```ts
   * await forge.server(123).site(456).redirectRules.import('from,to,type\n/a,/b,301\n');
   * ```
   */
  async import(csv: string | Blob, mode: RedirectRuleImportMode = "append"): Promise<number> {
    const form = new FormData();
    form.append(
      "file",
      typeof csv === "string" ? new Blob([csv], { type: "text/csv" }) : csv,
      "redirects.csv",
    );
    form.append("mode", mode);
    const response = await this.client.post<{ imported: number }>(`${this.basePath}/import`, form);
    return response?.imported ?? 0;
  }

  /**
   * Set the order of the redirect rules of the site.
   *
   * @example
   * ```ts
   * await forge.server(123).site(456).redirectRules.reorder([3, 1, 2]);
   * ```
   */
  async reorder(ruleIds: number[]): Promise<void> {
    await this.client.put(`${this.basePath}/reorder`, { redirects: ruleIds });
  }
}
