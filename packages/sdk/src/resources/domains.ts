import type {
  DomainAttributes,
  EnvironmentAttributes,
  HttpClient,
  JsonApiDocument,
  JsonApiListDocument,
} from "@studiometa/forge-api";

import { unwrapDocument, unwrapListDocument } from "@studiometa/forge-api";

import { AsyncPaginatedIterator } from "../pagination.ts";
import { matchByName } from "../utils/name-matcher.ts";
import { BaseCollection } from "./base.ts";
import type { ResolveResult } from "./servers.ts";

/**
 * Options for listing domains.
 */
export interface DomainListOptions {
  /** Cursor for pagination (from previous response's next_cursor). */
  cursor?: string;
}

/**
 * Domains (primary and aliases) of a site.
 *
 * Access via `forge.server(id).site(id).domains`.
 *
 * @example
 * ```ts
 * const domains = await forge.server(123).site(456).domains.list();
 * ```
 */
export class DomainsCollection extends BaseCollection {
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
    return `/orgs/${this.orgSlug}/servers/${this.serverId}/sites/${this.siteId}/domains`;
  }

  /**
   * List the domains of this site.
   *
   * @example
   * ```ts
   * const domains = await forge.server(123).site(456).domains.list();
   *
   * // Fetch a specific cursor page:
   * const page2 = await forge.server(123).site(456).domains.list({ cursor: 'next-cursor-value' });
   * ```
   */
  async list(options: DomainListOptions = {}): Promise<Array<DomainAttributes & { id: number }>> {
    const query = options.cursor !== undefined ? `?page[cursor]=${options.cursor}` : "";
    const response = await this.client.get<JsonApiListDocument<DomainAttributes>>(
      `${this.basePath}${query}`,
    );
    return unwrapListDocument(response);
  }

  /**
   * Iterate over all domains of this site across all pages.
   *
   * @example
   * ```ts
   * const domains = await forge.server(123).site(456).domains.all().toArray();
   * ```
   */
  all(): AsyncPaginatedIterator<DomainAttributes & { id: number }> {
    return new AsyncPaginatedIterator<DomainAttributes & { id: number }>(async (cursor) => {
      const query = cursor !== null ? `?page[cursor]=${cursor}` : "";
      const response = await this.client.get<JsonApiListDocument<DomainAttributes>>(
        `${this.basePath}${query}`,
      );
      return {
        items: unwrapListDocument(response),
        nextCursor: response.meta.next_cursor ?? null,
      };
    });
  }

  /**
   * Find domains by name using case-insensitive partial matching.
   *
   * If exactly one domain matches the query exactly, only that domain is returned.
   * Otherwise all partial matches are returned.
   *
   * @example
   * ```ts
   * const result = await forge.server(123).site(456).domains.resolve('www.example.com');
   * // → { query: 'www.example.com', matches: [{ id: 789, name: 'www.example.com' }], total: 1 }
   * ```
   */
  async resolve(query: string): Promise<ResolveResult> {
    const domains = await this.all().toArray();
    const { exact, partial } = matchByName(domains, query, (d) => d.name);
    const matches = exact.length === 1 ? exact : partial;
    return {
      query,
      matches: matches.map((d) => ({ id: d.id, name: d.name })),
      total: matches.length,
    };
  }
}

/**
 * A specific domain of a site.
 *
 * Access via `forge.server(id).site(id).domain(id)`.
 *
 * @example
 * ```ts
 * const config = await forge.server(123).site(456).domain(789).nginx.get();
 * ```
 */
export class DomainResource extends BaseCollection {
  /** Nginx configuration for this domain. */
  readonly nginx: DomainNginxResource;

  /** @internal */
  constructor(
    client: HttpClient,
    orgSlug: string,
    serverId: number,
    siteId: number,
    domainId: number,
  ) {
    super(client, orgSlug);
    this.nginx = new DomainNginxResource(client, orgSlug, serverId, siteId, domainId);
  }
}

/**
 * Nginx configuration for one domain of a site.
 *
 * @example
 * ```ts
 * const config = await forge.server(123).site(456).domain(789).nginx.get();
 * await forge.server(123).site(456).domain(789).nginx.update('server { ... }');
 * ```
 */
export class DomainNginxResource extends BaseCollection {
  /** @internal */
  constructor(
    client: HttpClient,
    orgSlug: string,
    private readonly serverId: number,
    private readonly siteId: number,
    private readonly domainId: number,
  ) {
    super(client, orgSlug);
  }

  private get basePath(): string {
    return `/orgs/${this.orgSlug}/servers/${this.serverId}/sites/${this.siteId}/domains/${this.domainId}/nginx`;
  }

  /**
   * Get the Nginx configuration of this domain.
   *
   * @returns The Nginx config content as a string.
   *
   * @example
   * ```ts
   * const config = await forge.server(123).site(456).domain(789).nginx.get();
   * ```
   */
  async get(): Promise<string> {
    const response = await this.client.get<JsonApiDocument<EnvironmentAttributes>>(this.basePath);
    return unwrapDocument(response).content;
  }

  /**
   * Replace the Nginx configuration of this domain.
   *
   * @param content The full Nginx config content.
   *
   * @example
   * ```ts
   * await forge.server(123).site(456).domain(789).nginx.update('server { ... }');
   * ```
   */
  async update(content: string): Promise<void> {
    await this.client.put(this.basePath, { config: content });
  }
}
