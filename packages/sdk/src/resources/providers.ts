import type {
  HttpClient,
  ProviderAttributes,
  ProviderRegionAttributes,
  ProviderRegionSizeAttributes,
  ProviderSizeAttributes,
} from "@studiometa/forge-api";

import type { AllOptions, ListOptions } from "../list-options.ts";
import type { AsyncPaginatedIterator } from "../pagination.ts";

import { BaseCollection } from "./base.ts";

/** Options for listing providers, regions or sizes. */
export type ProviderListOptions = ListOptions;

/**
 * The server providers that Forge supports.
 *
 * Access via `forge.providers`, and `forge.provider(slug)` for its regions and sizes.
 *
 * @example
 * ```ts
 * const providers = await forge.providers.list();
 * ```
 */
export class ProvidersCollection extends BaseCollection {
  /**
   * List the server providers.
   *
   * @example
   * ```ts
   * const providers = await forge.providers.list();
   * ```
   */
  async list(
    options: ProviderListOptions = {},
  ): Promise<Array<ProviderAttributes & { id: number }>> {
    return this.listPage<ProviderAttributes>("/providers", options);
  }

  /**
   * Iterate over all the server providers.
   *
   * @example
   * ```ts
   * const providers = await forge.providers.all().toArray();
   * ```
   */
  all(
    options: AllOptions<ProviderListOptions> = {},
  ): AsyncPaginatedIterator<ProviderAttributes & { id: number }> {
    return this.iterate<ProviderAttributes>("/providers", options);
  }
}

/**
 * A server provider, with its regions and sizes.
 *
 * Access via `forge.provider(slug)`.
 *
 * @example
 * ```ts
 * const sizes = await forge.provider('hetzner').region('fsn1').sizes();
 * ```
 */
export class ProviderResource extends BaseCollection {
  /** @internal */
  constructor(
    client: HttpClient,
    orgSlug: string,
    private readonly provider: string,
  ) {
    super(client, orgSlug);
  }

  /** @internal */
  private get basePath(): string {
    return `/providers/${this.provider}`;
  }

  /**
   * Get the provider.
   *
   * @example
   * ```ts
   * const provider = await forge.provider('hetzner').get();
   * ```
   */
  async get(): Promise<ProviderAttributes & { id: number }> {
    return this.getResource<ProviderAttributes>(this.basePath);
  }

  /**
   * List the server sizes of the provider.
   *
   * @example
   * ```ts
   * const sizes = await forge.provider('hetzner').sizes();
   * ```
   */
  async sizes(
    options: ProviderListOptions = {},
  ): Promise<Array<ProviderSizeAttributes & { id: number }>> {
    return this.listPage<ProviderSizeAttributes>(`${this.basePath}/sizes`, options);
  }

  /**
   * Get a server size of the provider.
   *
   * @example
   * ```ts
   * const size = await forge.provider('hetzner').size('cpx31');
   * ```
   */
  async size(size: string): Promise<ProviderSizeAttributes & { id: number }> {
    return this.getResource<ProviderSizeAttributes>(`${this.basePath}/sizes/${size}`);
  }

  /**
   * List the regions of the provider.
   *
   * @example
   * ```ts
   * const regions = await forge.provider('hetzner').regions();
   * ```
   */
  async regions(
    options: ProviderListOptions = {},
  ): Promise<Array<ProviderRegionAttributes & { id: number }>> {
    return this.listPage<ProviderRegionAttributes>(`${this.basePath}/regions`, options);
  }

  /**
   * A region of the provider, with its server sizes.
   *
   * @example
   * ```ts
   * const region = await forge.provider('hetzner').region('fsn1').get();
   * ```
   */
  region(region: string): ProviderRegionResource {
    return new ProviderRegionResource(
      this.client,
      this.orgSlug,
      `${this.basePath}/regions/${region}`,
    );
  }
}

/**
 * A region of a server provider.
 *
 * Access via `forge.provider(slug).region(code)`.
 *
 * @example
 * ```ts
 * const sizes = await forge.provider('hetzner').region('fsn1').sizes();
 * ```
 */
export class ProviderRegionResource extends BaseCollection {
  /** @internal */
  constructor(
    client: HttpClient,
    orgSlug: string,
    private readonly basePath: string,
  ) {
    super(client, orgSlug);
  }

  /**
   * Get the region.
   *
   * @example
   * ```ts
   * const region = await forge.provider('hetzner').region('fsn1').get();
   * ```
   */
  async get(): Promise<ProviderRegionAttributes & { id: number }> {
    return this.getResource<ProviderRegionAttributes>(this.basePath);
  }

  /**
   * List the server sizes available in the region.
   *
   * @example
   * ```ts
   * const sizes = await forge.provider('hetzner').region('fsn1').sizes();
   * ```
   */
  async sizes(
    options: ProviderListOptions = {},
  ): Promise<Array<ProviderRegionSizeAttributes & { id: number }>> {
    return this.listPage<ProviderRegionSizeAttributes>(`${this.basePath}/sizes`, options);
  }

  /**
   * Get a server size available in the region.
   *
   * @example
   * ```ts
   * const size = await forge.provider('hetzner').region('fsn1').size('cpx31');
   * ```
   */
  async size(size: string): Promise<ProviderRegionSizeAttributes & { id: number }> {
    return this.getResource<ProviderRegionSizeAttributes>(`${this.basePath}/sizes/${size}`);
  }
}
