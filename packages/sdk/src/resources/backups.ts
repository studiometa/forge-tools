import type {
  BackupConfigResponse,
  BackupConfigsResponse,
  CreateBackupConfigData,
  ForgeBackupConfig,
  HttpClient,
} from "@studiometa/forge-api";

import { BaseCollection } from "./base.ts";
import { AsyncPaginatedIterator } from "../pagination.ts";

/**
 * Options for listing backup configurations.
 */
export interface BackupConfigListOptions {
  /** Page number to fetch (1-indexed). */
  page?: number;
}

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
    private readonly serverId: number,
  ) {
    super(client);
  }

  private get basePath(): string {
    return `/servers/${this.serverId}/backup-configs`;
  }

  /**
   * List backup configurations on this server.
   *
   * @example
   * ```ts
   * const backups = await forge.server(123).backups.list();
   *
   * // Fetch a specific page:
   * const page2 = await forge.server(123).backups.list({ page: 2 });
   * ```
   */
  async list(options: BackupConfigListOptions = {}): Promise<ForgeBackupConfig[]> {
    const query = options.page !== undefined ? `?page=${options.page}` : "";
    const response = await this.client.get<BackupConfigsResponse>(`${this.basePath}${query}`);
    return response.backups;
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
    options: Omit<BackupConfigListOptions, "page"> = {},
  ): AsyncPaginatedIterator<ForgeBackupConfig> {
    return new AsyncPaginatedIterator<ForgeBackupConfig>((page) => this.list({ ...options, page }));
  }

  /**
   * Get a specific backup configuration.
   *
   * @example
   * ```ts
   * const backup = await forge.server(123).backups.get(789);
   * ```
   */
  async get(backupId: number): Promise<ForgeBackupConfig> {
    const response = await this.client.get<BackupConfigResponse>(`${this.basePath}/${backupId}`);
    return response.backup;
  }

  /**
   * Create a new backup configuration.
   *
   * @example
   * ```ts
   * const backup = await forge.server(123).backups.create({
   *   provider: 's3',
   *   credentials: { key: 'ACCESS_KEY', secret: 'SECRET_KEY', region: 'us-east-1', bucket: 'my-bucket' },
   *   frequency: 'weekly',
   *   retention: 7,
   *   databases: [1, 2],
   * });
   * ```
   */
  async create(data: CreateBackupConfigData): Promise<ForgeBackupConfig> {
    const response = await this.client.post<BackupConfigResponse>(this.basePath, data);
    return response.backup;
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
}
