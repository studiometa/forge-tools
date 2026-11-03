import type {
  CreateStorageProviderData,
  JsonApiDocument,
  JsonApiListDocument,
  StorageProviderAttributes,
} from "@studiometa/forge-api";

import { unwrapDocument, unwrapListDocument } from "@studiometa/forge-api";

import { BaseCollection } from "./base.ts";
import { AsyncPaginatedIterator } from "../pagination.ts";

/**
 * Options for listing storage providers.
 */
export interface StorageProviderListOptions {
  /** Cursor for pagination (from previous response's next_cursor). */
  cursor?: string;
}

/**
 * Collection of storage providers: the S3-compatible buckets that database backups use.
 *
 * Access via `forge.storageProviders`.
 *
 * @example
 * ```ts
 * const providers = await forge.storageProviders.list();
 * ```
 */
export class StorageProvidersCollection extends BaseCollection {
  /** @internal */

  private get basePath(): string {
    return `/orgs/${this.orgSlug}/storage-providers`;
  }

  /**
   * List storage providers.
   *
   * @example
   * ```ts
   * const providers = await forge.storageProviders.list();
   *
   * // Fetch a specific cursor page:
   * const page2 = await forge.storageProviders.list({ cursor: 'next-cursor-value' });
   * ```
   */
  async list(
    options: StorageProviderListOptions = {},
  ): Promise<Array<StorageProviderAttributes & { id: number }>> {
    const query = options.cursor !== undefined ? `?page[cursor]=${options.cursor}` : "";
    const response = await this.client.get<JsonApiListDocument<StorageProviderAttributes>>(
      `${this.basePath}${query}`,
    );
    return unwrapListDocument(response);
  }

  /**
   * Iterate over all storage providers across all pages.
   *
   * @example
   * ```ts
   * const providers = await forge.storageProviders.all().toArray();
   * ```
   */
  all(): AsyncPaginatedIterator<StorageProviderAttributes & { id: number }> {
    return new AsyncPaginatedIterator<StorageProviderAttributes & { id: number }>(
      async (cursor) => {
        const query = cursor !== null ? `?page[cursor]=${cursor}` : "";
        const response = await this.client.get<JsonApiListDocument<StorageProviderAttributes>>(
          `${this.basePath}${query}`,
        );
        return {
          items: unwrapListDocument(response),
          nextCursor: response.meta.next_cursor ?? null,
        };
      },
    );
  }

  /**
   * Get a specific storage provider.
   *
   * @example
   * ```ts
   * const provider = await forge.storageProviders.get(12);
   * ```
   */
  async get(providerId: number): Promise<StorageProviderAttributes & { id: number }> {
    const response = await this.client.get<JsonApiDocument<StorageProviderAttributes>>(
      `${this.basePath}/${providerId}`,
    );
    return unwrapDocument(response);
  }

  /**
   * Create a storage provider.
   *
   * @example
   * ```ts
   * const provider = await forge.storageProviders.create({
   *   name: 'Backups',
   *   provider: 'custom',
   *   endpoint: 'https://s3.example.com',
   *   region: 'eu-west-1',
   *   bucket: 'my-bucket',
   *   access_key: 'AKIA...',
   *   secret_key: process.env.S3_SECRET_KEY,
   * });
   * ```
   */
  async create(
    data: CreateStorageProviderData,
  ): Promise<StorageProviderAttributes & { id: number }> {
    const response = await this.client.post<JsonApiDocument<StorageProviderAttributes>>(
      this.basePath,
      data,
    );
    return unwrapDocument(response);
  }

  /**
   * Delete a storage provider. Forge refuses when a backup configuration uses it.
   *
   * @example
   * ```ts
   * await forge.storageProviders.delete(12);
   * ```
   */
  async delete(providerId: number): Promise<void> {
    await this.client.delete(`${this.basePath}/${providerId}`);
  }
}
