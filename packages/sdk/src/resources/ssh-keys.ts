import type {
  CreateSshKeyData,
  ForgeSshKey,
  HttpClient,
  SshKeyResponse,
  SshKeysResponse,
} from "@studiometa/forge-api";

import { BaseCollection } from "./base.ts";
import { AsyncPaginatedIterator } from "../pagination.ts";

/**
 * Options for listing SSH keys.
 */
export interface SshKeyListOptions {
  /** Page number to fetch (1-indexed). */
  page?: number;
}

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
    private readonly serverId: number,
  ) {
    super(client);
  }

  private get basePath(): string {
    return `/servers/${this.serverId}/keys`;
  }

  /**
   * List SSH keys on this server.
   *
   * @example
   * ```ts
   * const keys = await forge.server(123).sshKeys.list();
   *
   * // Fetch a specific page:
   * const page2 = await forge.server(123).sshKeys.list({ page: 2 });
   * ```
   */
  async list(options: SshKeyListOptions = {}): Promise<ForgeSshKey[]> {
    const query = options.page !== undefined ? `?page=${options.page}` : "";
    const response = await this.client.get<SshKeysResponse>(`${this.basePath}${query}`);
    return response.keys;
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
  all(options: Omit<SshKeyListOptions, "page"> = {}): AsyncPaginatedIterator<ForgeSshKey> {
    return new AsyncPaginatedIterator<ForgeSshKey>((page) => this.list({ ...options, page }));
  }

  /**
   * Get a specific SSH key.
   *
   * @example
   * ```ts
   * const key = await forge.server(123).sshKeys.get(789);
   * ```
   */
  async get(keyId: number): Promise<ForgeSshKey> {
    const response = await this.client.get<SshKeyResponse>(`${this.basePath}/${keyId}`);
    return response.key;
  }

  /**
   * Create a new SSH key.
   *
   * @example
   * ```ts
   * const key = await forge.server(123).sshKeys.create({
   *   name: 'deploy-key',
   *   key: 'ssh-rsa AAAA...',
   * });
   * ```
   */
  async create(data: CreateSshKeyData): Promise<ForgeSshKey> {
    const response = await this.client.post<SshKeyResponse>(this.basePath, data);
    return response.key;
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
