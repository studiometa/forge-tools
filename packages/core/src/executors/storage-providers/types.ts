/**
 * Option types for storage provider executors.
 */

import type { CreateStorageProviderData } from "@studiometa/forge-api";

/**
 * Options for listing storage providers.
 */
export interface ListStorageProvidersOptions {
  /** Filter by provider type, e.g. `s3` or `custom`. */
  provider?: string;
}

/**
 * Options for getting a single storage provider.
 */
export interface GetStorageProviderOptions {
  id: string;
}

/**
 * Options for creating a storage provider.
 */
export interface CreateStorageProviderOptions extends CreateStorageProviderData {}

/**
 * Options for deleting a storage provider.
 */
export interface DeleteStorageProviderOptions {
  id: string;
}
