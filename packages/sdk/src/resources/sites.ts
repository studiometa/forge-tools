import type {
  CreateSiteData,
  ForgeSite,
  HttpClient,
  SiteResponse,
  SitesResponse,
} from "@studiometa/forge-api";

import { AsyncPaginatedIterator } from "../pagination.ts";
import { DeploymentsCollection } from "./deployments.ts";
import { CertificatesCollection } from "./certificates.ts";
import { BaseCollection } from "./base.ts";

/**
 * Options for listing sites.
 */
export interface SiteListOptions {
  /** Page number to fetch (1-indexed). */
  page?: number;
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
    private readonly serverId: number,
  ) {
    super(client);
  }

  private get basePath(): string {
    return `/servers/${this.serverId}/sites`;
  }

  /**
   * List sites on this server.
   *
   * @example
   * ```ts
   * const sites = await forge.server(123).sites.list();
   *
   * // Fetch a specific page:
   * const page2 = await forge.server(123).sites.list({ page: 2 });
   * ```
   */
  async list(options: SiteListOptions = {}): Promise<ForgeSite[]> {
    const query = options.page !== undefined ? `?page=${options.page}` : "";
    const response = await this.client.get<SitesResponse>(`${this.basePath}${query}`);
    return response.sites;
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
  all(options: Omit<SiteListOptions, "page"> = {}): AsyncPaginatedIterator<ForgeSite> {
    return new AsyncPaginatedIterator<ForgeSite>((page) => this.list({ ...options, page }));
  }

  /**
   * Get a specific site by ID.
   *
   * @example
   * ```ts
   * const site = await forge.server(123).sites.get(456);
   * ```
   */
  async get(siteId: number): Promise<ForgeSite> {
    const response = await this.client.get<SiteResponse>(`${this.basePath}/${siteId}`);
    return response.site;
  }

  /**
   * Create a new site on this server.
   *
   * @example
   * ```ts
   * const site = await forge.server(123).sites.create({
   *   domain: 'example.com',
   *   project_type: 'php',
   *   directory: '/public',
   * });
   * ```
   */
  async create(data: CreateSiteData): Promise<ForgeSite> {
    const response = await this.client.post<SiteResponse>(this.basePath, data);
    return response.site;
  }

  /**
   * Update a site.
   *
   * @example
   * ```ts
   * await forge.server(123).sites.update(456, { directory: '/public' });
   * ```
   */
  async update(siteId: number, data: Partial<CreateSiteData>): Promise<ForgeSite> {
    const response = await this.client.put<SiteResponse>(`${this.basePath}/${siteId}`, data);
    return response.site;
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

  /** @internal */
  constructor(
    client: HttpClient,
    private readonly serverId: number,
    private readonly siteId: number,
  ) {
    super(client);
    this.deployments = new DeploymentsCollection(client, serverId, siteId);
    this.certificates = new CertificatesCollection(client, serverId, siteId);
    this.env = new SiteEnvResource(client, serverId, siteId);
    this.nginx = new SiteNginxResource(client, serverId, siteId);
  }

  private get basePath(): string {
    return `/servers/${this.serverId}/sites/${this.siteId}`;
  }

  /**
   * Get this site's details.
   *
   * @example
   * ```ts
   * const site = await forge.server(123).site(456).get();
   * ```
   */
  async get(): Promise<ForgeSite> {
    const response = await this.client.get<SiteResponse>(this.basePath);
    return response.site;
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
    await this.client.post(`${this.basePath}/deployment/deploy`);
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
    private readonly serverId: number,
    private readonly siteId: number,
  ) {
    super(client);
  }

  private get basePath(): string {
    return `/servers/${this.serverId}/sites/${this.siteId}/env`;
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
    private readonly serverId: number,
    private readonly siteId: number,
  ) {
    super(client);
  }

  private get basePath(): string {
    return `/servers/${this.serverId}/sites/${this.siteId}/nginx`;
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
