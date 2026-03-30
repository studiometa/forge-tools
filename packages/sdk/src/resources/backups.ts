import type {
  CreateBackupConfigData,
  HttpClient,
  JsonApiDocument,
  JsonApiListDocument,
  BackupConfigAttributes,
} from "@studiometa/forge-api";

import { unwrapDocument, unwrapListDocument } from "@studiometa/forge-api";

import { BaseCollection } from "./base.ts";
import { AsyncPaginatedIterator } from "../pagination.ts";

/**
 * Options for listing backup configurations.
 */
export interface BackupConfigListOptions {
  /** Cursor for pagination (from previous response's next_cursor). */
  cursor?: string;
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
    const query = options.cursor !== undefined ? `?page[cursor]=${options.cursor}` : "";
    const response = await this.client.get<JsonApiListDocument<BackupConfigAttributes>>(
      `${this.basePath}${query}`,
    );
    return unwrapListDocument(response);
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
  all(): AsyncPaginatedIterator<BackupConfigAttributes & { id: number }> {
    return new AsyncPaginatedIterator<BackupConfigAttributes & { id: number }>(async (cursor) => {
      const query = cursor !== null ? `?page[cursor]=${cursor}` : "";
      const response = await this.client.get<JsonApiListDocument<BackupConfigAttributes>>(
        `${this.basePath}${query}`,
      );
      return {
        items: unwrapListDocument(response),
        nextCursor: response.meta.next_cursor ?? null,
      };
    });
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
  async create(data: CreateBackupConfigData): Promise<BackupConfigAttributes & { id: number }> {
    const response = await this.client.post<JsonApiDocument<BackupConfigAttributes>>(
      this.basePath,
      data,
    );
    return unwrapDocument(response);
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
