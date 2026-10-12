import type {
  HttpClient,
  JsonApiDocument,
  JsonApiListDocument,
  PhpConfigAttributes,
  PhpMaxExecutionTimeAttributes,
  PhpMaxUploadSizeAttributes,
  PhpOpcacheAttributes,
  PhpVersionAttributes,
} from "@studiometa/forge-api";

import { unwrapDocument, unwrapListDocument } from "@studiometa/forge-api";

import { BaseCollection } from "./base.ts";

/**
 * The PHP configuration files that Forge can read and write.
 */
export const PHP_CONFIG_TYPES = ["cli", "fpm", "pool"] as const;

/**
 * A PHP configuration file that Forge can read and write.
 */
export type PhpConfigType = (typeof PHP_CONFIG_TYPES)[number];

/**
 * Options for listing PHP versions.
 */
export interface PhpVersionListOptions {
  /** Cursor for pagination (from previous response's next_cursor). */
  cursor?: string;
}

/**
 * Options for reading or writing a PHP configuration file.
 */
export interface PhpConfigOptions {
  /** Unix user of the FPM pool (pool only). */
  user?: string;
}

/**
 * Throw when the configuration type is not one of cli, fpm or pool,
 * or when a user is given for a type other than pool.
 */
function assertConfigTarget(type: string, options: PhpConfigOptions): void {
  if (!(PHP_CONFIG_TYPES as readonly string[]).includes(type)) {
    throw new Error(
      `Invalid PHP config type "${type}". Valid types: ${PHP_CONFIG_TYPES.join(", ")}.`,
    );
  }

  if (options.user && type !== "pool") {
    throw new Error(`The user option applies to the pool config only, not "${type}".`);
  }
}

/**
 * PHP on a server — installed versions, configuration files, limits and OPcache.
 *
 * Access via `forge.server(id).php`.
 *
 * Version methods take the PHP version ID from `list()`.
 *
 * @example
 * ```ts
 * const versions = await forge.server(123).php.list();
 * const fpm = await forge.server(123).php.config(versions[0].id, 'fpm');
 * await forge.server(123).php.setMaxUploadSize(64);
 * await forge.server(123).php.enableOpcache();
 * ```
 */
export class PhpResource extends BaseCollection {
  /** @internal */
  constructor(
    client: HttpClient,
    orgSlug: string,
    private readonly serverId: number,
  ) {
    super(client, orgSlug);
  }

  private get basePath(): string {
    return `/orgs/${this.orgSlug}/servers/${this.serverId}/php`;
  }

  /**
   * List the PHP versions installed on this server.
   *
   * @example
   * ```ts
   * const versions = await forge.server(123).php.list();
   * // → [{ id: 12, version: '8.3', binary_name: 'php8.3', status: 'installed', ... }]
   * ```
   */
  async list(
    options: PhpVersionListOptions = {},
  ): Promise<Array<PhpVersionAttributes & { id: number }>> {
    const query = options.cursor !== undefined ? `?page[cursor]=${options.cursor}` : "";
    const response = await this.client.get<JsonApiListDocument<PhpVersionAttributes>>(
      `${this.basePath}/versions${query}`,
    );
    return unwrapListDocument(response);
  }

  /**
   * Get one installed PHP version.
   *
   * @example
   * ```ts
   * const version = await forge.server(123).php.get(12);
   * ```
   */
  async get(versionId: number): Promise<PhpVersionAttributes & { id: number }> {
    const response = await this.client.get<JsonApiDocument<PhpVersionAttributes>>(
      `${this.basePath}/versions/${versionId}`,
    );
    return unwrapDocument(response);
  }

  /**
   * Get a PHP configuration file (cli, fpm or pool) of a version.
   *
   * @example
   * ```ts
   * const ini = await forge.server(123).php.config(12, 'fpm');
   * const pool = await forge.server(123).php.config(12, 'pool', { user: 'forge' });
   * ```
   */
  async config(
    versionId: number,
    type: PhpConfigType,
    options: PhpConfigOptions = {},
  ): Promise<string> {
    assertConfigTarget(type, options);
    const query = options.user ? `?user=${encodeURIComponent(options.user)}` : "";
    const response = await this.client.get<JsonApiDocument<PhpConfigAttributes>>(
      `${this.basePath}/versions/${versionId}/configs/${type}${query}`,
    );
    return unwrapDocument(response).configuration;
  }

  /**
   * Replace a PHP configuration file (cli, fpm or pool) of a version.
   *
   * @example
   * ```ts
   * await forge.server(123).php.updateConfig(12, 'fpm', 'memory_limit = 512M\n...');
   * ```
   */
  async updateConfig(
    versionId: number,
    type: PhpConfigType,
    content: string,
    options: PhpConfigOptions = {},
  ): Promise<void> {
    assertConfigTarget(type, options);
    await this.client.put(`${this.basePath}/versions/${versionId}/configs/${type}`, {
      config: content,
      ...(options.user ? { user: options.user } : {}),
    });
  }

  /**
   * Get the PHP max upload size, in megabytes.
   *
   * @example
   * ```ts
   * const size = await forge.server(123).php.maxUploadSize(); // → "64"
   * ```
   */
  async maxUploadSize(): Promise<string> {
    const response = await this.client.get<JsonApiDocument<PhpMaxUploadSizeAttributes>>(
      `${this.basePath}/max-upload-size`,
    );
    return String(unwrapDocument(response).max_upload_size);
  }

  /**
   * Set the PHP max upload size, in megabytes.
   *
   * @example
   * ```ts
   * await forge.server(123).php.setMaxUploadSize(128);
   * ```
   */
  async setMaxUploadSize(size: number): Promise<void> {
    await this.client.put(`${this.basePath}/max-upload-size`, { max_upload_size: size });
  }

  /**
   * Get the PHP max execution time, in seconds.
   *
   * @example
   * ```ts
   * const seconds = await forge.server(123).php.maxExecutionTime(); // → "60"
   * ```
   */
  async maxExecutionTime(): Promise<string> {
    const response = await this.client.get<JsonApiDocument<PhpMaxExecutionTimeAttributes>>(
      `${this.basePath}/max-execution-time`,
    );
    return String(unwrapDocument(response).max_execution_time);
  }

  /**
   * Set the PHP max execution time, in seconds.
   *
   * @example
   * ```ts
   * await forge.server(123).php.setMaxExecutionTime(120);
   * ```
   */
  async setMaxExecutionTime(seconds: number): Promise<void> {
    await this.client.put(`${this.basePath}/max-execution-time`, { max_execution_time: seconds });
  }

  /**
   * Get whether OPcache is enabled.
   *
   * @example
   * ```ts
   * const enabled = await forge.server(123).php.opcache(); // → true
   * ```
   */
  async opcache(): Promise<boolean> {
    const response = await this.client.get<JsonApiDocument<PhpOpcacheAttributes>>(
      `${this.basePath}/opcache`,
    );
    return unwrapDocument(response).opcache_enabled;
  }

  /**
   * Enable OPcache.
   *
   * @example
   * ```ts
   * await forge.server(123).php.enableOpcache();
   * ```
   */
  async enableOpcache(): Promise<void> {
    await this.client.post(`${this.basePath}/opcache`);
  }

  /**
   * Disable OPcache.
   *
   * @example
   * ```ts
   * await forge.server(123).php.disableOpcache();
   * ```
   */
  async disableOpcache(): Promise<void> {
    await this.client.delete(`${this.basePath}/opcache`);
  }
}
