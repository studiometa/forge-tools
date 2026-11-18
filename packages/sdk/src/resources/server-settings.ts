import type {
  HttpClient,
  LogAttributes,
  ServerAttributes,
  ServerKeyAttributes,
} from "@studiometa/forge-api";

import { BaseCollection } from "./base.ts";

/**
 * Base of the resources of one server.
 */
abstract class ServerScoped extends BaseCollection {
  /** @internal */
  constructor(
    client: HttpClient,
    orgSlug: string,
    protected readonly serverId: number,
  ) {
    super(client, orgSlug);
  }

  /** @internal */
  protected get serverPath(): string {
    return `/orgs/${this.orgSlug}/servers/${this.serverId}`;
  }
}

/**
 * The private network of a server: the servers that it can reach on their private IP.
 *
 * Access via `forge.server(id).network`.
 *
 * @example
 * ```ts
 * const servers = await forge.server(123).network.list();
 * ```
 */
export class ServerNetworkResource extends ServerScoped {
  /**
   * List the servers in the network of this server.
   *
   * @example
   * ```ts
   * const servers = await forge.server(123).network.list();
   * ```
   */
  async list(): Promise<Array<ServerAttributes & { id: number }>> {
    return this.listAll<ServerAttributes>(`${this.serverPath}/network`);
  }

  /**
   * Replace the servers in the network of this server.
   *
   * @example
   * ```ts
   * await forge.server(123).network.update([456, 789]);
   * ```
   */
  async update(serverIds: number[]): Promise<void> {
    await this.client.put(`${this.serverPath}/network`, { servers: serverIds });
  }
}

/**
 * The SSH key pair that Forge uses to connect to a server.
 *
 * Access via `forge.server(id).key`.
 *
 * @example
 * ```ts
 * const { public_key } = await forge.server(123).key.get();
 * ```
 */
export class ServerKeyResource extends ServerScoped {
  /**
   * Get the public key of the server.
   *
   * @example
   * ```ts
   * const key = await forge.server(123).key.get();
   * ```
   */
  async get(): Promise<ServerKeyAttributes & { id: number }> {
    return this.getResource<ServerKeyAttributes>(`${this.serverPath}/key`);
  }

  /**
   * Generate a new key pair for the server, and return its public key.
   *
   * @example
   * ```ts
   * const key = await forge.server(123).key.regenerate();
   * ```
   */
  async regenerate(): Promise<ServerKeyAttributes & { id: number }> {
    return this.putResource<ServerKeyAttributes>(`${this.serverPath}/key`);
  }
}

/**
 * The logs of a server, by key (for example `nginx_access`, `nginx_error`, `php8.3-fpm`).
 *
 * Access via `forge.server(id).logs`.
 *
 * @example
 * ```ts
 * const content = await forge.server(123).logs.get('nginx_error');
 * ```
 */
export class ServerLogsResource extends ServerScoped {
  /**
   * Get the content of a log of the server.
   *
   * @example
   * ```ts
   * const content = await forge.server(123).logs.get('nginx_error');
   * ```
   */
  async get(key: string): Promise<string> {
    return (
      await this.getResource<LogAttributes>(`${this.serverPath}/logs/${encodeURIComponent(key)}`)
    ).content;
  }

  /**
   * Clear a log of the server.
   *
   * @example
   * ```ts
   * await forge.server(123).logs.clear('nginx_error');
   * ```
   */
  async clear(key: string): Promise<void> {
    await this.client.delete(`${this.serverPath}/logs/${encodeURIComponent(key)}`);
  }
}
