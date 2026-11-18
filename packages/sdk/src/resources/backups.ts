import type {
  CreateBackupConfigData,
  HttpClient,
  JsonApiDocument,
  BackupConfigAttributes,
  UpdateBackupConfigData,
  BackupAttributes,
} from "@studiometa/forge-api";

import { unwrapDocument } from "@studiometa/forge-api";

import type { AllOptions, ListOptions } from "../list-options.ts";

import { BaseCollection } from "./base.ts";
import type { AsyncPaginatedIterator } from "../pagination.ts";

/** Options for listing the backups of a backup configuration. */
export type BackupListOptions = ListOptions<"status", "created_at" | "updated_at">;

/**
 * Options for listing backup configurations.
 */
export type BackupConfigListOptions = ListOptions<
  "name" | "status",
  "name" | "created_at" | "updated_at"
>;

/**
 * Collection of backup configurations on a server.
 *
 * Access via `forge.server(id).backups`.
 *
 * @example
 * ```ts
 * const backups = await forge.server(123).backups.list();
 * ```
 */
export class BackupsCollection extends BaseCollection {
  /** @internal */
  constructor(
    client: HttpClient,
    orgSlug: string,
    private readonly serverId: number,
  ) {
    super(client, orgSlug);
  }

  private get basePath(): string {
    return `/orgs/${this.orgSlug}/servers/${this.serverId}/database/backups`;
  }

  /**
   * List backup configurations on this server.
   *
   * @example
   * ```ts
   * const backups = await forge.server(123).backups.list();
   *
   * // Fetch a specific cursor page:
   * const page2 = await forge.server(123).backups.list({ cursor: 'next-cursor-value' });
   * ```
   */
  async list(
    options: BackupConfigListOptions = {},
  ): Promise<Array<BackupConfigAttributes & { id: number }>> {
    return this.listPage<BackupConfigAttributes>(this.basePath, options);
  }

  /**
   * Iterate over all backup configurations across all pages.
   *
   * @example
   * ```ts
   * for await (const backup of forge.server(123).backups.all()) {
   *   console.log(backup);
   * }
   *
   * // Or collect all at once:
   * const backups = await forge.server(123).backups.all().toArray();
   * ```
   */
  all(
    options: AllOptions<BackupConfigListOptions> = {},
  ): AsyncPaginatedIterator<BackupConfigAttributes & { id: number }> {
    return this.iterate<BackupConfigAttributes>(this.basePath, options);
  }

  /**
   * Get a specific backup configuration.
   *
   * @example
   * ```ts
   * const backup = await forge.server(123).backups.get(789);
   * ```
   */
  async get(backupId: number): Promise<BackupConfigAttributes & { id: number }> {
    const response = await this.client.get<JsonApiDocument<BackupConfigAttributes>>(
      `${this.basePath}/${backupId}`,
    );
    return unwrapDocument(response);
  }

  /**
   * Create a new backup configuration.
   *
   * Forge answers `202 Accepted` without a body: the configuration is created in the background.
   *
   * @example
   * ```ts
   * await forge.server(123).backups.create({
   *   provider: 's3',
   *   credentials: { key: 'ACCESS_KEY', secret: 'SECRET_KEY', region: 'us-east-1', bucket: 'my-bucket' },
   *   frequency: 'weekly',
   *   retention: 7,
   *   databases: [1, 2],
   * });
   * ```
   */
  async create(data: CreateBackupConfigData): Promise<void> {
    await this.client.post(this.basePath, data);
  }

  /**
   * Delete a backup configuration.
   *
   * @example
   * ```ts
   * await forge.server(123).backups.delete(789);
   * ```
   */
  async delete(backupId: number): Promise<void> {
    await this.client.delete(`${this.basePath}/${backupId}`);
  }

  /**
   * Update a backup configuration.
   *
   * @example
   * ```ts
   * await forge.server(123).backups.update(456, { ...config, retention: 14 });
   * ```
   */
  async update(backupId: number, data: UpdateBackupConfigData): Promise<void> {
    await this.client.put(`${this.basePath}/${backupId}`, data);
  }

  /**
   * The backups made by a backup configuration.
   *
   * @example
   * ```ts
   * const backups = await forge.server(123).backups.instances(456).list();
   * ```
   */
  instances(backupId: number): BackupInstancesCollection {
    return new BackupInstancesCollection(this.client, this.orgSlug, `${this.basePath}/${backupId}`);
  }
}

/**
 * The backups made by a backup configuration.
 *
 * Access via `forge.server(id).backups.instances(configId)`.
 *
 * @example
 * ```ts
 * await forge.server(123).backups.instances(456).restore(789, 12);
 * ```
 */
export class BackupInstancesCollection extends BaseCollection {
  /** @internal */
  constructor(
    client: HttpClient,
    orgSlug: string,
    private readonly configPath: string,
  ) {
    super(client, orgSlug);
  }

  /** @internal */
  private get basePath(): string {
    return `${this.configPath}/instances`;
  }

  /**
   * List the backups.
   *
   * @example
   * ```ts
   * const backups = await forge.server(123).backups.instances(456).list();
   * ```
   */
  async list(options: BackupListOptions = {}): Promise<Array<BackupAttributes & { id: number }>> {
    return this.listPage<BackupAttributes>(this.basePath, options);
  }

  /**
   * Iterate over all the backups.
   *
   * @example
   * ```ts
   * const backups = await forge.server(123).backups.instances(456).all().toArray();
   * ```
   */
  all(
    options: AllOptions<BackupListOptions> = {},
  ): AsyncPaginatedIterator<BackupAttributes & { id: number }> {
    return this.iterate<BackupAttributes>(this.basePath, options);
  }

  /**
   * Get a backup.
   *
   * @example
   * ```ts
   * const backup = await forge.server(123).backups.instances(456).get(789);
   * ```
   */
  async get(instanceId: number): Promise<BackupAttributes & { id: number }> {
    return this.getResource<BackupAttributes>(`${this.basePath}/${instanceId}`);
  }

  /**
   * Make a backup now.
   *
   * @example
   * ```ts
   * await forge.server(123).backups.instances(456).create();
   * ```
   */
  async create(): Promise<void> {
    await this.client.post(this.basePath);
  }

  /**
   * Delete a backup.
   *
   * @example
   * ```ts
   * await forge.server(123).backups.instances(456).delete(789);
   * ```
   */
  async delete(instanceId: number): Promise<void> {
    await this.client.delete(`${this.basePath}/${instanceId}`);
  }

  /**
   * Restore a backup into a database.
   *
   * @example
   * ```ts
   * await forge.server(123).backups.instances(456).restore(789, 12);
   * ```
   */
  async restore(instanceId: number, databaseId: number): Promise<void> {
    await this.client.post(`${this.basePath}/${instanceId}/restores`, { database_id: databaseId });
  }
}
