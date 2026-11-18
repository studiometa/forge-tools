import type {
  CreateDomainData,
  DomainActionData,
  DomainAttributes,
  DomainRecordConfigurationAttributes,
  NginxConfigAttributes,
  UpdateDomainData,
} from "@studiometa/forge-api";

import type { AllOptions, ListOptions } from "../list-options.ts";
import type { AsyncPaginatedIterator } from "../pagination.ts";

import { SiteScoped } from "./site-scoped.ts";

/** Options for listing the domains of a site. */
export type DomainListOptions = ListOptions<"status" | "type", "name" | "created_at">;

/**
 * The domains of a site: its primary domain and its aliases.
 *
 * Access via `forge.server(id).site(id).domains`.
 *
 * @example
 * ```ts
 * const domains = await forge.server(123).site(456).domains.list();
 * ```
 */
export class DomainsCollection extends SiteScoped {
  /** @internal */
  private get basePath(): string {
    return `${this.sitePath}/domains`;
  }

  /**
   * List the domains of the site.
   *
   * @example
   * ```ts
   * const domains = await forge.server(123).site(456).domains.list();
   * ```
   */
  async list(options: DomainListOptions = {}): Promise<Array<DomainAttributes & { id: number }>> {
    return this.listPage<DomainAttributes>(this.basePath, options);
  }

  /**
   * Iterate over all the domains of the site.
   *
   * @example
   * ```ts
   * const domains = await forge.server(123).site(456).domains.all().toArray();
   * ```
   */
  all(
    options: AllOptions<DomainListOptions> = {},
  ): AsyncPaginatedIterator<DomainAttributes & { id: number }> {
    return this.iterate<DomainAttributes>(this.basePath, options);
  }

  /**
   * Get a domain of the site.
   *
   * @example
   * ```ts
   * const domain = await forge.server(123).site(456).domains.get(789);
   * ```
   */
  async get(domainId: number): Promise<DomainAttributes & { id: number }> {
    return this.getResource<DomainAttributes>(`${this.basePath}/${domainId}`);
  }

  /**
   * Add a domain to the site.
   *
   * @example
   * ```ts
   * const domain = await forge.server(123).site(456).domains.create({
   *   name: 'www.example.com',
   *   allow_wildcard_subdomains: false,
   *   www_redirect_type: 'none',
   * });
   * ```
   */
  async create(data: CreateDomainData): Promise<DomainAttributes & { id: number }> {
    return this.postResource<DomainAttributes>(this.basePath, data);
  }

  /**
   * Update a domain of the site.
   *
   * @example
   * ```ts
   * await forge.server(123).site(456).domains.update(789, { www_redirect_type: 'to-www' });
   * ```
   */
  async update(
    domainId: number,
    data: UpdateDomainData,
  ): Promise<DomainAttributes & { id: number }> {
    return this.patchResource<DomainAttributes>(`${this.basePath}/${domainId}`, data);
  }

  /**
   * Remove a domain from the site.
   *
   * @example
   * ```ts
   * await forge.server(123).site(456).domains.delete(789);
   * ```
   */
  async delete(domainId: number): Promise<void> {
    await this.client.delete(`${this.basePath}/${domainId}`);
  }

  /**
   * List the DNS records that the domain needs.
   *
   * @example
   * ```ts
   * const records = await forge.server(123).site(456).domains.configurations(789);
   * ```
   */
  async configurations(
    domainId: number,
  ): Promise<Array<DomainRecordConfigurationAttributes & { id: number }>> {
    return this.listAll<DomainRecordConfigurationAttributes>(
      `${this.basePath}/${domainId}/configurations`,
    );
  }

  /**
   * Run an action on a domain: `enable`, `disable` or `mark-as-primary`.
   *
   * @example
   * ```ts
   * await forge.server(123).site(456).domains.action(789, { action: 'mark-as-primary' });
   * ```
   */
  async action(domainId: number, data: DomainActionData): Promise<void> {
    await this.client.post(`${this.basePath}/${domainId}/actions`, data);
  }

  /**
   * Get the Nginx configuration of a domain.
   *
   * @example
   * ```ts
   * const config = await forge.server(123).site(456).domains.nginx(789);
   * ```
   */
  async nginx(domainId: number): Promise<string> {
    const config = await this.getResource<NginxConfigAttributes>(
      `${this.basePath}/${domainId}/nginx`,
    );
    return config.content ?? "";
  }

  /**
   * Replace the Nginx configuration of a domain.
   *
   * @example
   * ```ts
   * await forge.server(123).site(456).domains.updateNginx(789, 'server { ... }');
   * ```
   */
  async updateNginx(domainId: number, content: string): Promise<void> {
    await this.client.put(`${this.basePath}/${domainId}/nginx`, { config: content });
  }
}
