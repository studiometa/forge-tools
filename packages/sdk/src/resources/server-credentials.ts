import type {
  HttpClient,
  JsonApiDocument,
  JsonApiResource,
  ServerCredentialAttributes,
  VpcAttributes,
} from "@studiometa/forge-api";

import type { AllOptions, ListOptions } from "../list-options.ts";
import type { AsyncPaginatedIterator } from "../pagination.ts";

import { BaseCollection } from "./base.ts";

/** A private network, with the ID of the provider (a string). */
export type Vpc = VpcAttributes & { id: string };

/** Unwrap a network: its ID is the ID of the provider, not a number. */
function unwrapVpc(resource: JsonApiResource<VpcAttributes>): Vpc {
  return { ...resource.attributes, id: resource.id };
}

/** Options for listing server credentials. */
export type ServerCredentialListOptions = ListOptions;

/**
 * The server provider credentials of the organization.
 *
 * Access via `forge.serverCredentials`.
 *
 * @example
 * ```ts
 * const credentials = await forge.serverCredentials.list();
 * ```
 */
export class ServerCredentialsCollection extends BaseCollection {
  /** @internal */
  private get basePath(): string {
    return `/orgs/${this.orgSlug}/server-credentials`;
  }

  /**
   * List the server credentials.
   *
   * @example
   * ```ts
   * const credentials = await forge.serverCredentials.list();
   * ```
   */
  async list(
    options: ServerCredentialListOptions = {},
  ): Promise<Array<ServerCredentialAttributes & { id: number }>> {
    return this.listPage<ServerCredentialAttributes>(this.basePath, options);
  }

  /**
   * Iterate over all the server credentials.
   *
   * @example
   * ```ts
   * const credentials = await forge.serverCredentials.all().toArray();
   * ```
   */
  all(
    options: AllOptions<ServerCredentialListOptions> = {},
  ): AsyncPaginatedIterator<ServerCredentialAttributes & { id: number }> {
    return this.iterate<ServerCredentialAttributes>(this.basePath, options);
  }

  /**
   * Get a server credential.
   *
   * @example
   * ```ts
   * const credential = await forge.serverCredentials.get(8);
   * ```
   */
  async get(credentialId: number): Promise<ServerCredentialAttributes & { id: number }> {
    return this.getResource<ServerCredentialAttributes>(`${this.basePath}/${credentialId}`);
  }

  /**
   * The private networks (VPCs) of a credential in a region.
   *
   * @example
   * ```ts
   * const vpcs = await forge.serverCredentials.vpcs(8, 'fsn1').list();
   * ```
   */
  vpcs(credentialId: number, region: string): VpcsCollection {
    return new VpcsCollection(
      this.client,
      this.orgSlug,
      `${this.basePath}/${credentialId}/regions/${region}/vpcs`,
    );
  }
}

/**
 * The private networks (VPCs) of a server credential in a region.
 *
 * Access via `forge.serverCredentials.vpcs(credentialId, region)`.
 *
 * @example
 * ```ts
 * const vpc = await forge.serverCredentials.vpcs(8, 'fsn1').create('production');
 * ```
 */
export class VpcsCollection extends BaseCollection {
  /** @internal */
  constructor(
    client: HttpClient,
    orgSlug: string,
    private readonly basePath: string,
  ) {
    super(client, orgSlug);
  }

  /**
   * List the networks.
   *
   * @example
   * ```ts
   * const vpcs = await forge.serverCredentials.vpcs(8, 'fsn1').list();
   * ```
   */
  async list(): Promise<Vpc[]> {
    const response = await this.client.get<{ data: JsonApiResource<VpcAttributes>[] }>(
      this.basePath,
    );
    return response.data.map(unwrapVpc);
  }

  /**
   * Get a network.
   *
   * @example
   * ```ts
   * const vpc = await forge.serverCredentials.vpcs(8, 'fsn1').get('vpc-123');
   * ```
   */
  async get(vpcId: string): Promise<Vpc> {
    const response = await this.client.get<JsonApiDocument<VpcAttributes>>(
      `${this.basePath}/${encodeURIComponent(vpcId)}`,
    );
    return unwrapVpc(response.data);
  }

  /**
   * Create a network.
   *
   * @example
   * ```ts
   * const vpc = await forge.serverCredentials.vpcs(8, 'fsn1').create('production');
   * ```
   */
  async create(name: string): Promise<Vpc> {
    const response = await this.client.post<JsonApiDocument<VpcAttributes>>(this.basePath, {
      name,
    });
    return unwrapVpc(response.data);
  }
}
