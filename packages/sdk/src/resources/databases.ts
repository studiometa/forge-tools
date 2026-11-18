import type {
  CreateDatabaseData,
  HttpClient,
  JsonApiDocument,
  DatabaseAttributes,
} from "@studiometa/forge-api";

import { unwrapDocument } from "@studiometa/forge-api";

import type { AllOptions, ListOptions } from "../list-options.ts";

import { BaseCollection } from "./base.ts";
import { AsyncPaginatedIterator } from "../pagination.ts";

/**
 * Options for listing databases.
 */
export type DatabaseListOptions = ListOptions<
  "name" | "status",
  "name" | "created_at" | "updated_at"
>;

/**
 * Collection of databases on a server.
 *
 * Access via `forge.server(id).databases`.
 *
 * @example
 * ```ts
 * const dbs = await forge.server(123).databases.list();
 * ```
 */
export class DatabasesCollection extends BaseCollection {
  /** @internal */
  constructor(
    client: HttpClient,
    orgSlug: string,
    private readonly serverId: number,
  ) {
    super(client, orgSlug);
  }

  private get basePath(): string {
    return `/orgs/${this.orgSlug}/servers/${this.serverId}/database/schemas`;
  }

  /**
   * List databases on this server.
   *
   * @example
   * ```ts
   * const dbs = await forge.server(123).databases.list();
   *
   * // Fetch a specific cursor page:
   * const page2 = await forge.server(123).databases.list({ cursor: 'next-cursor-value' });
   * ```
   */
  async list(
    options: DatabaseListOptions = {},
  ): Promise<Array<DatabaseAttributes & { id: number }>> {
    return this.listPage<DatabaseAttributes>(this.basePath, options);
  }

  /**
   * Iterate over all databases across all pages.
   *
   * @example
   * ```ts
   * for await (const db of forge.server(123).databases.all()) {
   *   console.log(db);
   * }
   *
   * // Or collect all at once:
   * const dbs = await forge.server(123).databases.all().toArray();
   * ```
   */
  all(
    options: AllOptions<DatabaseListOptions> = {},
  ): AsyncPaginatedIterator<DatabaseAttributes & { id: number }> {
    return this.iterate<DatabaseAttributes>(this.basePath, options);
  }

  /**
   * Get a specific database.
   *
   * @example
   * ```ts
   * const db = await forge.server(123).databases.get(789);
   * ```
   */
  async get(databaseId: number): Promise<DatabaseAttributes & { id: number }> {
    const response = await this.client.get<JsonApiDocument<DatabaseAttributes>>(
      `${this.basePath}/${databaseId}`,
    );
    return unwrapDocument(response);
  }

  /**
   * Create a new database.
   *
   * @example
   * ```ts
   * const db = await forge.server(123).databases.create({
   *   name: 'myapp',
   *   user: 'admin',
   *   password: 'secret',
   * });
   * ```
   */
  async create(data: CreateDatabaseData): Promise<DatabaseAttributes & { id: number }> {
    const response = await this.client.post<JsonApiDocument<DatabaseAttributes>>(
      this.basePath,
      data,
    );
    return unwrapDocument(response);
  }

  /**
   * Delete a database.
   *
   * @example
   * ```ts
   * await forge.server(123).databases.delete(789);
   * ```
   */
  async delete(databaseId: number): Promise<void> {
    await this.client.delete(`${this.basePath}/${databaseId}`);
  }

  /**
   * Synchronize the databases of the server: add to Forge the databases created outside it.
   *
   * @example
   * ```ts
   * await forge.server(123).databases.synchronize();
   * ```
   */
  async synchronize(): Promise<void> {
    await this.client.post(`${this.basePath}/synchronizations`);
  }

  /**
   * Update the password of the root database user of the server.
   *
   * @example
   * ```ts
   * await forge.server(123).databases.updatePassword('secret');
   * ```
   */
  async updatePassword(password: string): Promise<void> {
    await this.client.put(`/orgs/${this.orgSlug}/servers/${this.serverId}/database/password`, {
      password,
    });
  }
}
