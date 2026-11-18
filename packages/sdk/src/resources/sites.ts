import type {
  CreateLoadBalancerSiteData,
  CreateSiteData,
  HttpClient,
  JsonApiDocument,
  SiteAttributes,
  UpdateSiteData,
  UpdateGitData,
  EnvironmentAttributes,
  NginxConfigAttributes,
} from "@studiometa/forge-api";

import { unwrapDocument } from "@studiometa/forge-api";

import type { AsyncPaginatedIterator } from "../pagination.ts";
import { matchByName } from "../utils/name-matcher.ts";
import type { ResolveResult } from "./servers.ts";
import { DeploymentsCollection } from "./deployments.ts";
import { CertificatesCollection } from "./certificates.ts";
import { CommandsCollection } from "./commands.ts";
import { SecurityRulesCollection } from "./security-rules.ts";
import { RedirectRulesCollection } from "./redirect-rules.ts";
import { ScheduledJobsCollection } from "./scheduled-jobs.ts";
import { DomainsCollection } from "./domains.ts";
import { ComposerCredentialsCollection, NpmCredentialsCollection } from "./credentials.ts";
import { HeartbeatsCollection } from "./heartbeats.ts";
import { IntegrationsResource } from "./integrations.ts";
import { WebhooksCollection } from "./webhooks.ts";
import {
  SiteDeployKeyResource,
  SiteHealthcheckResource,
  SiteLoadBalancingResource,
  SiteLogsResource,
} from "./site-settings.ts";
import type { AllOptions, ListOptions } from "../list-options.ts";

import { BaseCollection } from "./base.ts";

/**
 * Options for updating the environment file of a site.
 */
export interface UpdateEnvironmentOptions {
  /** Run `php artisan config:cache` after the update. */
  cache?: boolean;
  /** Restart the queue workers after the update. */
  queues?: boolean;
  /** Encrypt the file with this key (`php artisan env:encrypt`). */
  encryptionKey?: string | null;
}

/**
 * Options for listing sites.
 */
export type SiteListOptions = ListOptions<
  "name",
  "name" | "created_at" | "updated_at",
  | "server"
  | "serverCount"
  | "serverExists"
  | "tags"
  | "tagsCount"
  | "tagsExists"
  | "latestDeployment"
  | "latestDeploymentCount"
  | "latestDeploymentExists"
  | "securityRules"
  | "securityRulesCount"
  | "securityRulesExists"
  | "redirectRules"
  | "redirectRulesCount"
  | "redirectRulesExists"
>;

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
    return this.listPage<SiteAttributes>(this.basePath, options);
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
  all(
    options: AllOptions<SiteListOptions> = {},
  ): AsyncPaginatedIterator<SiteAttributes & { id: number }> {
    return this.iterate<SiteAttributes>(this.basePath, options);
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
   * Create a site on this server when it is a load balancer, with the servers that it sends
   * traffic to. Forge installs the site in the background: its status is `installing` at first.
   *
   * @example
   * ```ts
   * const site = await forge.server(123).sites.createLoadBalancer({
   *   domain: 'example.com',
   *   balancer_method: 'round_robin',
   *   balancing: [{ server_id: 456 }, { server_id: 789 }],
   * });
   * ```
   */
  async createLoadBalancer(
    data: CreateLoadBalancerSiteData,
  ): Promise<SiteAttributes & { id: number }> {
    const response = await this.client.post<JsonApiDocument<SiteAttributes>>(
      `${this.basePath}/balancer`,
      data,
    );
    return unwrapDocument(response);
  }

  /**
   * Update a site.
   *
   * Forge answers `202 Accepted` without a body: the site is updated in the background.
   *
   * @example
   * ```ts
   * await forge.server(123).sites.update(456, { directory: '/public' });
   * ```
   */
  async update(siteId: number, data: UpdateSiteData): Promise<void> {
    await this.client.put(`${this.basePath}/${siteId}`, data);
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

  /** Scheduled jobs of this site. */
  readonly scheduledJobs: ScheduledJobsCollection;

  /** Domains of this site. */
  readonly domains: DomainsCollection;

  /** Healthcheck endpoint of this site. */
  readonly healthcheck: SiteHealthcheckResource;

  /** Nginx and application logs of this site. */
  readonly logs: SiteLogsResource;

  /** Deploy key of this site. */
  readonly deployKey: SiteDeployKeyResource;

  /** Nodes of this site, on a load balancer. */
  readonly loadBalancing: SiteLoadBalancingResource;

  /** Credentials of the private Composer repositories of this site. */
  readonly composerCredentials: ComposerCredentialsCollection;

  /** Credentials of the private npm registries of this site. */
  readonly npmCredentials: NpmCredentialsCollection;

  /** Heartbeats of this site. */
  readonly heartbeats: HeartbeatsCollection;

  /** Laravel integrations of this site (Horizon, Octane, Reverb, Pulse...). */
  readonly integrations: IntegrationsResource;

  /** Deployment webhooks of this site. */
  readonly webhooks: WebhooksCollection;

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
    this.scheduledJobs = new ScheduledJobsCollection(client, orgSlug, serverId, siteId);
    this.domains = new DomainsCollection(client, orgSlug, serverId, siteId);
    this.healthcheck = new SiteHealthcheckResource(client, orgSlug, serverId, siteId);
    this.logs = new SiteLogsResource(client, orgSlug, serverId, siteId);
    this.deployKey = new SiteDeployKeyResource(client, orgSlug, serverId, siteId);
    this.loadBalancing = new SiteLoadBalancingResource(client, orgSlug, serverId, siteId);
    this.composerCredentials = new ComposerCredentialsCollection(client, orgSlug, serverId, siteId);
    this.npmCredentials = new NpmCredentialsCollection(client, orgSlug, serverId, siteId);
    this.heartbeats = new HeartbeatsCollection(client, orgSlug, serverId, siteId);
    this.integrations = new IntegrationsResource(client, orgSlug, serverId, siteId);
    this.webhooks = new WebhooksCollection(client, orgSlug, serverId, siteId);
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
    await this.client.post(`${this.basePath}/deployments`);
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

  /**
   * Change the source control provider, repository or branch that the site deploys from.
   *
   * @example
   * ```ts
   * await forge.server(123).site(456).updateGit({
   *   source_control_provider: 'github',
   *   repository: 'acme/website',
   *   branch: 'main',
   * });
   * ```
   */
  async updateGit(data: UpdateGitData): Promise<SiteAttributes & { id: number }> {
    return this.putResource<SiteAttributes>(`${this.basePath}/git`, data);
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
    return (await this.getResource<EnvironmentAttributes>(this.basePath)).content;
  }

  /**
   * Update the environment file content.
   *
   * @param content The full .env file content.
   * @param options Cache the config, restart the queues, or encrypt the file with a key.
   */
  async update(content: string, options: UpdateEnvironmentOptions = {}): Promise<void> {
    await this.client.put(this.basePath, {
      environment: content,
      ...(options.cache === undefined ? {} : { cache: options.cache }),
      ...(options.queues === undefined ? {} : { queues: options.queues }),
      ...(options.encryptionKey === undefined ? {} : { encryption_key: options.encryptionKey }),
    });
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
    return (await this.getResource<NginxConfigAttributes>(this.basePath)).content ?? "";
  }

  /**
   * Update the Nginx configuration.
   *
   * @param content The full Nginx config content.
   */
  async update(content: string): Promise<void> {
    await this.client.put(this.basePath, { config: content });
  }
}
