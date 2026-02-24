import type {
  CreateDaemonData,
  ForgeDaemon,
  HttpClient,
  DaemonResponse,
  DaemonsResponse,
} from "@studiometa/forge-api";

import { BaseCollection } from "./base.ts";

/**
 * Collection of daemons (background processes) on a server.
 *
 * Access via `forge.server(id).daemons`.
 *
 * @example
 * ```ts
 * const daemons = await forge.server(123).daemons.list();
 * ```
 */
export class DaemonsCollection extends BaseCollection {
  /** @internal */
  constructor(
    client: HttpClient,
    private readonly serverId: number,
  ) {
    super(client);
  }

  private get basePath(): string {
    return `/servers/${this.serverId}/daemons`;
  }

  /**
   * List all daemons on this server.
   *
   * @example
   * ```ts
   * const daemons = await forge.server(123).daemons.list();
   * ```
   */
  async list(): Promise<ForgeDaemon[]> {
    const response = await this.client.get<DaemonsResponse>(this.basePath);
    return response.daemons;
  }

  /**
   * Get a specific daemon.
   *
   * @example
   * ```ts
   * const daemon = await forge.server(123).daemons.get(789);
   * ```
   */
  async get(daemonId: number): Promise<ForgeDaemon> {
    const response = await this.client.get<DaemonResponse>(`${this.basePath}/${daemonId}`);
    return response.daemon;
  }

  /**
   * Create a new daemon.
   *
   * @example
   * ```ts
   * const daemon = await forge.server(123).daemons.create({
   *   command: 'php artisan queue:work',
   *   user: 'forge',
   * });
   * ```
   */
  async create(data: CreateDaemonData): Promise<ForgeDaemon> {
    const response = await this.client.post<DaemonResponse>(this.basePath, data);
    return response.daemon;
  }

  /**
   * Delete a daemon.
   *
   * @example
   * ```ts
   * await forge.server(123).daemons.delete(789);
   * ```
   */
  async delete(daemonId: number): Promise<void> {
    await this.client.delete(`${this.basePath}/${daemonId}`);
  }

  /**
   * Restart a daemon.
   *
   * @example
   * ```ts
   * await forge.server(123).daemons.restart(789);
   * ```
   */
  async restart(daemonId: number): Promise<void> {
    await this.client.post(`${this.basePath}/${daemonId}/restart`);
  }
}
