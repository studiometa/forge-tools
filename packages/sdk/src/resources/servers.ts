import type {
  CreateServerData,
  ForgeServer,
  HttpClient,
  ServerResponse,
  ServersResponse,
} from "@studiometa/forge-api";

import { SitesCollection, SiteResource } from "./sites.ts";
import { DatabasesCollection } from "./databases.ts";
import { DaemonsCollection } from "./daemons.ts";
import { BaseCollection } from "./base.ts";

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
  constructor(client: HttpClient) {
    super(client);
  }

  /**
   * List all servers.
   *
   * @example
   * ```ts
   * const servers = await forge.servers.list();
   * ```
   */
  async list(): Promise<ForgeServer[]> {
    const response = await this.client.get<ServersResponse>("/servers");
    return response.servers;
  }

  /**
   * Get a specific server by ID.
   *
   * @example
   * ```ts
   * const server = await forge.servers.get(123);
   * ```
   */
  async get(serverId: number): Promise<ForgeServer> {
    const response = await this.client.get<ServerResponse>(`/servers/${serverId}`);
    return response.server;
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
  async create(data: CreateServerData): Promise<ForgeServer> {
    const response = await this.client.post<ServerResponse>("/servers", data);
    return response.server;
  }

  /**
   * Update a server.
   *
   * @example
   * ```ts
   * await forge.servers.update(123, { name: 'web-1-renamed' });
   * ```
   */
  async update(serverId: number, data: Partial<CreateServerData>): Promise<ForgeServer> {
    const response = await this.client.put<ServerResponse>(`/servers/${serverId}`, data);
    return response.server;
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
    await this.client.delete(`/servers/${serverId}`);
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
    await this.client.post(`/servers/${serverId}/reboot`);
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

  /** Daemons (background processes) on this server. */
  readonly daemons: DaemonsCollection;

  /** @internal */
  constructor(
    client: HttpClient,
    private readonly serverId: number,
  ) {
    super(client);
    this.sites = new SitesCollection(client, serverId);
    this.databases = new DatabasesCollection(client, serverId);
    this.daemons = new DaemonsCollection(client, serverId);
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
    return new SiteResource(this.client, this.serverId, siteId);
  }

  /**
   * Get this server's details.
   *
   * @example
   * ```ts
   * const server = await forge.server(123).get();
   * ```
   */
  async get(): Promise<ForgeServer> {
    const response = await this.client.get<ServerResponse>(`/servers/${this.serverId}`);
    return response.server;
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
    await this.client.post(`/servers/${this.serverId}/reboot`);
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
    await this.client.delete(`/servers/${this.serverId}`);
  }
}
