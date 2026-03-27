import type {
  CreateSiteData,
  HttpClient,
  JsonApiDocument,
  JsonApiListDocument,
  SiteAttributes,
} from "@studiometa/forge-api";

import { unwrapDocument, unwrapListDocument } from "@studiometa/forge-api";

import { AsyncPaginatedIterator } from "../pagination.ts";
import { matchByName } from "../utils/name-matcher.ts";
import type { ResolveResult } from "./servers.ts";
import { DeploymentsCollection } from "./deployments.ts";
import { CertificatesCollection } from "./certificates.ts";
import { CommandsCollection } from "./commands.ts";
import { SecurityRulesCollection } from "./security-rules.ts";
import { RedirectRulesCollection } from "./redirect-rules.ts";
import { BaseCollection } from "./base.ts";

/**
 * Options for listing sites.
 */
export interface SiteListOptions {
  /** Cursor for pagination (from previous response's next_cursor). */
  cursor?: string;
}

/**
 * Collection of sites on a server.
 *
 * Access via `forge.server(id).sites`.
 *
 * @example
 * ```ts
 * const sites = await forge.server(123).sites.list();
 * ```
 */
export class SitesCollection extends BaseCollection {
  /** @internal */
  constructor(
    client: HttpClient,
    orgSlug: string,
    private readonly serverId: number,
  ) {
    super(client, orgSlug);
  }

  private get basePath(): string {
    return `/orgs/${this.orgSlug}/servers/${this.serverId}/sites`;
  }

  /**
   * List sites on this server.
   *
   * @example
   * ```ts
   * const sites = await forge.server(123).sites.list();
   *
   * // Fetch a specific cursor page:
   * const page2 = await forge.server(123).sites.list({ cursor: 'next-cursor-value' });
   * ```
   */
  async list(options: SiteListOptions = {}): Promise<Array<SiteAttributes & { id: number }>> {
    const query = options.cursor !== undefined ? `?page[cursor]=${options.cursor}` : "";
    const response = await this.client.get<JsonApiListDocument<SiteAttributes>>(
      `${this.basePath}${query}`,
    );
    return unwrapListDocument(response);
  }

  /**
   * Iterate over all sites across all pages.
   *
   * @example
   * ```ts
   * for await (const site of forge.server(123).sites.all()) {
   *   console.log(site);
   * }
   *
   * // Or collect all at once:
   * const sites = await forge.server(123).sites.all().toArray();
   * ```
   */
  all(): AsyncPaginatedIterator<SiteAttributes & { id: number }> {
    return new AsyncPaginatedIterator<SiteAttributes & { id: number }>(async (cursor) => {
      const query = cursor !== null ? `?page[cursor]=${cursor}` : "";
      const response = await this.client.get<JsonApiListDocument<SiteAttributes>>(
        `${this.basePath}${query}`,
      );
      return {
        items: unwrapListDocument(response),
        nextCursor: response.meta.next_cursor ?? null,
      };
    });
  }

  /**
   * Get a specific site by ID.
   *
   * @example
   * ```ts
   * const site = await forge.server(123).sites.get(456);
   * ```
   */
  async get(siteId: number): Promise<SiteAttributes & { id: number }> {
    const response = await this.client.get<JsonApiDocument<SiteAttributes>>(
      `/orgs/${this.orgSlug}/sites/${siteId}`,
    );
    return unwrapDocument(response);
  }

  /**
   * Create a new site on this server.
   *
   * @example
   * ```ts
   * const site = await forge.server(123).sites.create({
   *   type: 'php',
   *   name: 'example.com',
   *   directory: '/public',
   * });
   * ```
   */
  async create(data: CreateSiteData): Promise<SiteAttributes & { id: number }> {
    const response = await this.client.post<JsonApiDocument<SiteAttributes>>(this.basePath, data);
    return unwrapDocument(response);
  }

  /**
   * Update a site.
   *
   * @example
   * ```ts
   * await forge.server(123).sites.update(456, { directory: '/public' });
   * ```
   */
  async update(
    siteId: number,
    data: Partial<CreateSiteData>,
  ): Promise<SiteAttributes & { id: number }> {
    const response = await this.client.put<JsonApiDocument<SiteAttributes>>(
      `${this.basePath}/${siteId}`,
      data,
    );
    return unwrapDocument(response);
  }

  /**
   * Delete a site.
   *
   * @example
   * ```ts
   * await forge.server(123).sites.delete(456);
   * ```
   */
  async delete(siteId: number): Promise<void> {
    await this.client.delete(`${this.basePath}/${siteId}`);
  }

  /**
   * Find sites by domain name using case-insensitive partial matching.
   *
   * If exactly one site matches the query exactly, only that site is returned.
   * Otherwise all partial matches are returned.
   *
   * @param query - The search query to match against site domain names.
   * @returns Resolve result with matching sites.
   *
   * @example
   * ```ts
   * // Find sites matching "example"
   * const result = await forge.server(123).sites.resolve('example');
   * // → { query: 'example', matches: [{ id: 456, name: 'example.com' }], total: 1 }
   * ```
   */
  async resolve(query: string): Promise<ResolveResult> {
    const sites = await this.list();
    const { exact, partial } = matchByName(sites, query, (s) => s.name);
    const matches = exact.length === 1 ? exact : partial;
    return {
      query,
      matches: matches.map((s) => ({ id: s.id, name: s.name })),
      total: matches.length,
    };
  }
}

/**
 * A specific site with nested resources and actions.
 *
 * Access via `forge.server(id).site(id)`.
 *
 * @example
 * ```ts
 * // Deploy
 * await forge.server(123).site(456).deploy();
 *
 * // Get environment
 * const env = await forge.server(123).site(456).env.get();
 * ```
 */
export class SiteResource extends BaseCollection {
  /** Deployments for this site. */
  readonly deployments: DeploymentsCollection;

  /** SSL certificates for this site. */
  readonly certificates: CertificatesCollection;

  /** Environment variables for this site. */
  readonly env: SiteEnvResource;

  /** Nginx configuration for this site. */
  readonly nginx: SiteNginxResource;

  /** Commands run on this site. */
  readonly commands: CommandsCollection;

  /** Security rules for this site. */
  readonly securityRules: SecurityRulesCollection;

  /** Redirect rules for this site. */
  readonly redirectRules: RedirectRulesCollection;

  /** @internal */
  constructor(
    client: HttpClient,
    orgSlug: string,
    private readonly serverId: number,
    private readonly siteId: number,
  ) {
    super(client, orgSlug);
    this.deployments = new DeploymentsCollection(client, orgSlug, serverId, siteId);
    this.certificates = new CertificatesCollection(client, orgSlug, serverId, siteId);
    this.env = new SiteEnvResource(client, orgSlug, serverId, siteId);
    this.nginx = new SiteNginxResource(client, orgSlug, serverId, siteId);
    this.commands = new CommandsCollection(client, orgSlug, serverId, siteId);
    this.securityRules = new SecurityRulesCollection(client, orgSlug, serverId, siteId);
    this.redirectRules = new RedirectRulesCollection(client, orgSlug, serverId, siteId);
  }

  private get basePath(): string {
    return `/orgs/${this.orgSlug}/servers/${this.serverId}/sites/${this.siteId}`;
  }

  /**
   * Get this site's details.
   *
   * @example
   * ```ts
   * const site = await forge.server(123).site(456).get();
   * ```
   */
  async get(): Promise<SiteAttributes & { id: number }> {
    const response = await this.client.get<JsonApiDocument<SiteAttributes>>(
      `/orgs/${this.orgSlug}/sites/${this.siteId}`,
    );
    return unwrapDocument(response);
  }

  /**
   * Deploy this site.
   *
   * @example
   * ```ts
   * await forge.server(123).site(456).deploy();
   * ```
   */
  async deploy(): Promise<void> {
    await this.client.post(`${this.basePath}/deployments/deploy`);
  }

  /**
   * Delete this site.
   *
   * @example
   * ```ts
   * await forge.server(123).site(456).delete();
   * ```
   */
  async delete(): Promise<void> {
    await this.client.delete(this.basePath);
  }
}

/**
 * Environment variables for a site.
 *
 * @example
 * ```ts
 * const env = await forge.server(123).site(456).env.get();
 * await forge.server(123).site(456).env.update('APP_ENV=production\n...');
 * ```
 */
export class SiteEnvResource extends BaseCollection {
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
    return `/orgs/${this.orgSlug}/servers/${this.serverId}/sites/${this.siteId}/environment`;
  }

  /**
   * Get the environment file content.
   *
   * @returns The .env file content as a string.
   */
  async get(): Promise<string> {
    return this.client.get<string>(this.basePath);
  }

  /**
   * Update the environment file content.
   *
   * @param content The full .env file content.
   */
  async update(content: string): Promise<void> {
    await this.client.put(this.basePath, { content });
  }
}

/**
 * Nginx configuration for a site.
 *
 * @example
 * ```ts
 * const config = await forge.server(123).site(456).nginx.get();
 * await forge.server(123).site(456).nginx.update('server { ... }');
 * ```
 */
export class SiteNginxResource extends BaseCollection {
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
    return `/orgs/${this.orgSlug}/servers/${this.serverId}/sites/${this.siteId}/nginx`;
  }

  /**
   * Get the Nginx configuration.
   *
   * @returns The Nginx config content as a string.
   */
  async get(): Promise<string> {
    return this.client.get<string>(this.basePath);
  }

  /**
   * Update the Nginx configuration.
   *
   * @param content The full Nginx config content.
   */
  async update(content: string): Promise<void> {
    await this.client.put(this.basePath, { content });
  }
}
