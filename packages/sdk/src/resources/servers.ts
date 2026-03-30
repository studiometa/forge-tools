import type {
  CreateServerData,
  HttpClient,
  JsonApiDocument,
  JsonApiListDocument,
  ServerAttributes,
} from "@studiometa/forge-api";

import { unwrapDocument, unwrapListDocument } from "@studiometa/forge-api";

import { AsyncPaginatedIterator } from "../pagination.ts";
import { matchByName } from "../utils/name-matcher.ts";
import { SitesCollection, SiteResource } from "./sites.ts";
import { DatabasesCollection } from "./databases.ts";
import { DatabaseUsersCollection } from "./database-users.ts";
import { DaemonsCollection } from "./daemons.ts";
import { BackupsCollection } from "./backups.ts";
import { ScheduledJobsCollection } from "./scheduled-jobs.ts";
import { MonitorsCollection } from "./monitors.ts";
import { FirewallRulesCollection } from "./firewall-rules.ts";
import { SshKeysCollection } from "./ssh-keys.ts";
import { NginxTemplatesCollection } from "./nginx-templates.ts";
import { BaseCollection } from "./base.ts";

/**
 * A matched resource item with ID and name.
 */
export interface ResolveMatch {
  id: number;
  name: string;
}

/**
 * Result of a resolve operation.
 */
export interface ResolveResult {
  query: string;
  matches: ResolveMatch[];
  total: number;
}

/**
 * Options for listing servers.
 */
export interface ServerListOptions {
  /** Cursor for pagination (from previous response's next_cursor). */
  cursor?: string;
}

/**
 * Collection of servers.
 *
 * Access via `forge.servers`.
 *
 * @example
 * ```ts
 * // List all servers
 * const servers = await forge.servers.list();
 *
 * // Get a specific server
 * const server = await forge.servers.get(123);
 *
 * // Create a new server
 * const server = await forge.servers.create({ ... });
 * ```
 */
export class ServersCollection extends BaseCollection {
  /** @internal */
  constructor(client: HttpClient, orgSlug: string) {
    super(client, orgSlug);
  }

  private get basePath(): string {
    return `/orgs/${this.orgSlug}/servers`;
  }

  /**
   * List servers.
   *
   * @example
   * ```ts
   * const servers = await forge.servers.list();
   *
   * // Fetch a specific cursor page:
   * const page2 = await forge.servers.list({ cursor: 'next-cursor-value' });
   * ```
   */
  async list(options: ServerListOptions = {}): Promise<Array<ServerAttributes & { id: number }>> {
    const query = options.cursor !== undefined ? `?page[cursor]=${options.cursor}` : "";
    const response = await this.client.get<JsonApiListDocument<ServerAttributes>>(
      `${this.basePath}${query}`,
    );
    return unwrapListDocument(response);
  }

  /**
   * Iterate over all servers across all pages.
   *
   * @example
   * ```ts
   * for await (const server of forge.servers.all()) {
   *   console.log(server);
   * }
   *
   * // Or collect all at once:
   * const servers = await forge.servers.all().toArray();
   * ```
   */
  all(): AsyncPaginatedIterator<ServerAttributes & { id: number }> {
    return new AsyncPaginatedIterator<ServerAttributes & { id: number }>(async (cursor) => {
      const query = cursor !== null ? `?page[cursor]=${cursor}` : "";
      const response = await this.client.get<JsonApiListDocument<ServerAttributes>>(
        `${this.basePath}${query}`,
      );
      return {
        items: unwrapListDocument(response),
        nextCursor: response.meta.next_cursor ?? null,
      };
    });
  }

  /**
   * Get a specific server by ID.
   *
   * @example
   * ```ts
   * const server = await forge.servers.get(123);
   * ```
   */
  async get(serverId: number): Promise<ServerAttributes & { id: number }> {
    const response = await this.client.get<JsonApiDocument<ServerAttributes>>(
      `${this.basePath}/${serverId}`,
    );
    return unwrapDocument(response);
  }

  /**
   * Create a new server.
   *
   * @example
   * ```ts
   * const server = await forge.servers.create({
   *   provider: 'ocean2',
   *   credential_id: 1,
   *   name: 'web-1',
   *   type: 'app',
   *   size: '01',
   *   region: 'ams3',
   * });
   * ```
   */
  async create(data: CreateServerData): Promise<ServerAttributes & { id: number }> {
    const response = await this.client.post<JsonApiDocument<ServerAttributes>>(this.basePath, data);
    return unwrapDocument(response);
  }

  /**
   * Update a server.
   *
   * @example
   * ```ts
   * await forge.servers.update(123, { name: 'web-1-renamed' });
   * ```
   */
  async update(
    serverId: number,
    data: Partial<CreateServerData>,
  ): Promise<ServerAttributes & { id: number }> {
    const response = await this.client.put<JsonApiDocument<ServerAttributes>>(
      `${this.basePath}/${serverId}`,
      data,
    );
    return unwrapDocument(response);
  }

  /**
   * Delete a server.
   *
   * @example
   * ```ts
   * await forge.servers.delete(123);
   * ```
   */
  async delete(serverId: number): Promise<void> {
    await this.client.delete(`${this.basePath}/${serverId}`);
  }

  /**
   * Reboot a server.
   *
   * @example
   * ```ts
   * await forge.servers.reboot(123);
   * ```
   */
  async reboot(serverId: number): Promise<void> {
    await this.client.post(`${this.basePath}/${serverId}/reboot`);
  }

  /**
   * Find servers by name using case-insensitive partial matching.
   *
   * If exactly one server matches the query exactly, only that server is returned.
   * Otherwise all partial matches are returned.
   *
   * @param query - The search query to match against server names.
   * @returns Resolve result with matching servers.
   *
   * @example
   * ```ts
   * // Find servers matching "prod"
   * const result = await forge.servers.resolve('prod');
   * // → { query: 'prod', matches: [{ id: 725393, name: 'wilo-grove-prod' }], total: 1 }
   *
   * // Use the result to access a server
   * if (result.total === 1) {
   *   const sites = await forge.server(result.matches[0].id).sites.list();
   * }
   * ```
   */
  async resolve(query: string): Promise<ResolveResult> {
    const servers = await this.list();
    const { exact, partial } = matchByName(servers, query, (s) => s.name);
    const matches = exact.length === 1 ? exact : partial;
    return {
      query,
      matches: matches.map((s) => ({ id: s.id, name: s.name })),
      total: matches.length,
    };
  }
}

/**
 * A specific server with nested resources.
 *
 * Access via `forge.server(id)`.
 *
 * @example
 * ```ts
 * // Access sites on a server
 * const sites = await forge.server(123).sites.list();
 *
 * // Access databases on a server
 * const dbs = await forge.server(123).databases.list();
 * ```
 */
export class ServerResource extends BaseCollection {
  /** Sites on this server. */
  readonly sites: SitesCollection;

  /** Databases on this server. */
  readonly databases: DatabasesCollection;

  /** Database users on this server. */
  readonly databaseUsers: DatabaseUsersCollection;

  /** Daemons (background processes) on this server. */
  readonly daemons: DaemonsCollection;

  /** Backup configurations on this server. */
  readonly backups: BackupsCollection;

  /** Scheduled jobs (cron jobs) on this server. */
  readonly scheduledJobs: ScheduledJobsCollection;

  /** Monitors on this server. */
  readonly monitors: MonitorsCollection;

  /** Firewall rules on this server. */
  readonly firewallRules: FirewallRulesCollection;

  /** SSH keys on this server. */
  readonly sshKeys: SshKeysCollection;

  /** Nginx templates on this server. */
  readonly nginxTemplates: NginxTemplatesCollection;

  /** @internal */
  constructor(
    client: HttpClient,
    orgSlug: string,
    private readonly serverId: number,
  ) {
    super(client, orgSlug);
    this.sites = new SitesCollection(client, orgSlug, serverId);
    this.databases = new DatabasesCollection(client, orgSlug, serverId);
    this.databaseUsers = new DatabaseUsersCollection(client, orgSlug, serverId);
    this.daemons = new DaemonsCollection(client, orgSlug, serverId);
    this.backups = new BackupsCollection(client, orgSlug, serverId);
    this.scheduledJobs = new ScheduledJobsCollection(client, orgSlug, serverId);
    this.monitors = new MonitorsCollection(client, orgSlug, serverId);
    this.firewallRules = new FirewallRulesCollection(client, orgSlug, serverId);
    this.sshKeys = new SshKeysCollection(client, orgSlug, serverId);
    this.nginxTemplates = new NginxTemplatesCollection(client, orgSlug, serverId);
  }

  /**
   * Access a specific site on this server, with nested resources.
   *
   * @example
   * ```ts
   * // Deploy a site
   * await forge.server(123).site(456).deploy();
   *
   * // Get environment variables
   * const env = await forge.server(123).site(456).env.get();
   * ```
   */
  site(siteId: number): SiteResource {
    return new SiteResource(this.client, this.orgSlug, this.serverId, siteId);
  }

  /**
   * Get this server's details.
   *
   * @example
   * ```ts
   * const server = await forge.server(123).get();
   * ```
   */
  async get(): Promise<ServerAttributes & { id: number }> {
    const response = await this.client.get<JsonApiDocument<ServerAttributes>>(
      `/orgs/${this.orgSlug}/servers/${this.serverId}`,
    );
    return unwrapDocument(response);
  }

  /**
   * Reboot this server.
   *
   * @example
   * ```ts
   * await forge.server(123).reboot();
   * ```
   */
  async reboot(): Promise<void> {
    await this.client.post(`/orgs/${this.orgSlug}/servers/${this.serverId}/reboot`);
  }

  /**
   * Delete this server.
   *
   * @example
   * ```ts
   * await forge.server(123).delete();
   * ```
   */
  async delete(): Promise<void> {
    await this.client.delete(`/orgs/${this.orgSlug}/servers/${this.serverId}`);
  }
}
