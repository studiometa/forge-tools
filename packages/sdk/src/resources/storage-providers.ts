import type {
  CreateStorageProviderData,
  JsonApiDocument,
  StorageProviderAttributes,
  UpdateStorageProviderData,
} from "@studiometa/forge-api";

import { unwrapDocument } from "@studiometa/forge-api";

import type { AllOptions, ListOptions } from "../list-options.ts";

import { BaseCollection } from "./base.ts";
import { AsyncPaginatedIterator } from "../pagination.ts";

/**
 * Options for listing storage providers.
 */
export type StorageProviderListOptions = ListOptions<
  "provider",
  "name" | "provider" | "created_at" | "updated_at"
>;

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
    return this.listPage<StorageProviderAttributes>(this.basePath, options);
  }

  /**
   * Iterate over all storage providers across all pages.
   *
   * @example
   * ```ts
   * const providers = await forge.storageProviders.all().toArray();
   * ```
   */
  all(
    options: AllOptions<StorageProviderListOptions> = {},
  ): AsyncPaginatedIterator<StorageProviderAttributes & { id: number }> {
    return this.iterate<StorageProviderAttributes>(this.basePath, options);
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

  /**
   * Update a storage provider.
   *
   * @example
   * ```ts
   * await forge.storageProviders.update(3, { name: 'Backups', provider: 's3' });
   * ```
   */
  async update(
    providerId: number,
    data: UpdateStorageProviderData & { assume_role?: boolean },
  ): Promise<StorageProviderAttributes & { id: number }> {
    return this.putResource<StorageProviderAttributes>(`${this.basePath}/${providerId}`, data);
  }
}
