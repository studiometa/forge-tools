import type {
  CreateDaemonData,
  HttpClient,
  JsonApiDocument,
  BackgroundProcessAttributes,
  BackgroundProcessLogAttributes,
  UpdateDaemonData,
} from "@studiometa/forge-api";

import { unwrapDocument } from "@studiometa/forge-api";

import type { AllOptions, ListOptions } from "../list-options.ts";

import { BaseCollection } from "./base.ts";
import { AsyncPaginatedIterator } from "../pagination.ts";

/** The actions that the API runs on a daemon. */
export type DaemonAction = "restart" | "stop" | "start" | "empty-log";

/**
 * Options for listing daemons.
 */
export type DaemonListOptions = ListOptions<"user" | "site_id" | "directory", "user">;

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
    orgSlug: string,
    private readonly serverId: number,
  ) {
    super(client, orgSlug);
  }

  private get basePath(): string {
    return `/orgs/${this.orgSlug}/servers/${this.serverId}/background-processes`;
  }

  /**
   * List daemons on this server.
   *
   * @example
   * ```ts
   * const daemons = await forge.server(123).daemons.list();
   *
   * // Fetch a specific cursor page:
   * const page2 = await forge.server(123).daemons.list({ cursor: 'next-cursor-value' });
   * ```
   */
  async list(
    options: DaemonListOptions = {},
  ): Promise<Array<BackgroundProcessAttributes & { id: number }>> {
    return this.listPage<BackgroundProcessAttributes>(this.basePath, options);
  }

  /**
   * Iterate over all daemons across all pages.
   *
   * @example
   * ```ts
   * for await (const daemon of forge.server(123).daemons.all()) {
   *   console.log(daemon);
   * }
   *
   * // Or collect all at once:
   * const daemons = await forge.server(123).daemons.all().toArray();
   * ```
   */
  all(
    options: AllOptions<DaemonListOptions> = {},
  ): AsyncPaginatedIterator<BackgroundProcessAttributes & { id: number }> {
    return this.iterate<BackgroundProcessAttributes>(this.basePath, options);
  }

  /**
   * Get a specific daemon.
   *
   * @example
   * ```ts
   * const daemon = await forge.server(123).daemons.get(789);
   * ```
   */
  async get(daemonId: number): Promise<BackgroundProcessAttributes & { id: number }> {
    const response = await this.client.get<JsonApiDocument<BackgroundProcessAttributes>>(
      `${this.basePath}/${daemonId}`,
    );
    return unwrapDocument(response);
  }

  /**
   * Get the log output of a daemon.
   *
   * @example
   * ```ts
   * const log = await forge.server(123).daemons.log(789);
   * ```
   */
  async log(daemonId: number): Promise<string> {
    const response = await this.client.get<JsonApiDocument<BackgroundProcessLogAttributes>>(
      `${this.basePath}/${daemonId}/log`,
    );
    return unwrapDocument(response).content;
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
  async create(data: CreateDaemonData): Promise<BackgroundProcessAttributes & { id: number }> {
    const response = await this.client.post<JsonApiDocument<BackgroundProcessAttributes>>(
      this.basePath,
      data,
    );
    return unwrapDocument(response);
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
    await this.action(daemonId, "restart");
  }

  /**
   * Update the name or the Supervisor configuration of a daemon.
   *
   * @example
   * ```ts
   * await forge.server(123).daemons.update(456, { name: 'queue' });
   * ```
   */
  async update(daemonId: number, data: UpdateDaemonData): Promise<void> {
    await this.client.put(`${this.basePath}/${daemonId}`, data);
  }

  /**
   * Run an action on a daemon: `restart`, `stop`, `start` or `empty-log`.
   *
   * @example
   * ```ts
   * await forge.server(123).daemons.action(456, 'stop');
   * ```
   */
  async action(daemonId: number, action: DaemonAction): Promise<void> {
    await this.client.post(`${this.basePath}/${daemonId}/actions`, { action });
  }
}
