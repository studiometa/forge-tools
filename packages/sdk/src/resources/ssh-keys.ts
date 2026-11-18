import type {
  CreateSshKeyData,
  HttpClient,
  JsonApiDocument,
  SshKeyAttributes,
} from "@studiometa/forge-api";

import { unwrapDocument } from "@studiometa/forge-api";

import type { AllOptions, ListOptions } from "../list-options.ts";

import { BaseCollection } from "./base.ts";
import { AsyncPaginatedIterator } from "../pagination.ts";

/**
 * Options for listing SSH keys.
 */
export type SshKeyListOptions = ListOptions<"name" | "user">;

/**
 * Collection of SSH keys on a server.
 *
 * Access via `forge.server(id).sshKeys`.
 *
 * @example
 * ```ts
 * const keys = await forge.server(123).sshKeys.list();
 * ```
 */
export class SshKeysCollection extends BaseCollection {
  /** @internal */
  constructor(
    client: HttpClient,
    orgSlug: string,
    private readonly serverId: number,
  ) {
    super(client, orgSlug);
  }

  private get basePath(): string {
    return `/orgs/${this.orgSlug}/servers/${this.serverId}/ssh-keys`;
  }

  /**
   * List SSH keys on this server.
   *
   * @example
   * ```ts
   * const keys = await forge.server(123).sshKeys.list();
   *
   * // Fetch a specific cursor page:
   * const page2 = await forge.server(123).sshKeys.list({ cursor: 'next-cursor-value' });
   * ```
   */
  async list(options: SshKeyListOptions = {}): Promise<Array<SshKeyAttributes & { id: number }>> {
    return this.listPage<SshKeyAttributes>(this.basePath, options);
  }

  /**
   * Iterate over all SSH keys across all pages.
   *
   * @example
   * ```ts
   * for await (const key of forge.server(123).sshKeys.all()) {
   *   console.log(key);
   * }
   *
   * // Or collect all at once:
   * const keys = await forge.server(123).sshKeys.all().toArray();
   * ```
   */
  all(
    options: AllOptions<SshKeyListOptions> = {},
  ): AsyncPaginatedIterator<SshKeyAttributes & { id: number }> {
    return this.iterate<SshKeyAttributes>(this.basePath, options);
  }

  /**
   * Get a specific SSH key.
   *
   * @example
   * ```ts
   * const key = await forge.server(123).sshKeys.get(789);
   * ```
   */
  async get(keyId: number): Promise<SshKeyAttributes & { id: number }> {
    const response = await this.client.get<JsonApiDocument<SshKeyAttributes>>(
      `${this.basePath}/${keyId}`,
    );
    return unwrapDocument(response);
  }

  /**
   * Create a new SSH key.
   *
   * Forge answers `202 Accepted` without a body: the key is installed in the background.
   *
   * @example
   * ```ts
   * await forge.server(123).sshKeys.create({
   *   name: 'deploy-key',
   *   key: 'ssh-rsa AAAA...',
   * });
   * ```
   */
  async create(data: CreateSshKeyData): Promise<void> {
    await this.client.post(this.basePath, data);
  }

  /**
   * Delete an SSH key.
   *
   * @example
   * ```ts
   * await forge.server(123).sshKeys.delete(789);
   * ```
   */
  async delete(keyId: number): Promise<void> {
    await this.client.delete(`${this.basePath}/${keyId}`);
  }
}
