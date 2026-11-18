import type {
  CreateDatabaseUserData,
  HttpClient,
  JsonApiDocument,
  DatabaseUserAttributes,
  UpdateDatabaseUserData,
} from "@studiometa/forge-api";

import { unwrapDocument } from "@studiometa/forge-api";

import type { AllOptions, ListOptions } from "../list-options.ts";

import { BaseCollection } from "./base.ts";
import { AsyncPaginatedIterator } from "../pagination.ts";

/**
 * Options for listing database users.
 */
export type DatabaseUserListOptions = ListOptions<
  "name" | "status",
  "name" | "created_at" | "updated_at"
>;

/**
 * Collection of database users on a server.
 *
 * Access via `forge.server(id).databaseUsers`.
 *
 * @example
 * ```ts
 * const users = await forge.server(123).databaseUsers.list();
 * ```
 */
export class DatabaseUsersCollection extends BaseCollection {
  /** @internal */
  constructor(
    client: HttpClient,
    orgSlug: string,
    private readonly serverId: number,
  ) {
    super(client, orgSlug);
  }

  private get basePath(): string {
    return `/orgs/${this.orgSlug}/servers/${this.serverId}/database/users`;
  }

  /**
   * List database users on this server.
   *
   * @example
   * ```ts
   * const users = await forge.server(123).databaseUsers.list();
   *
   * // Fetch a specific cursor page:
   * const page2 = await forge.server(123).databaseUsers.list({ cursor: 'next-cursor-value' });
   * ```
   */
  async list(
    options: DatabaseUserListOptions = {},
  ): Promise<Array<DatabaseUserAttributes & { id: number }>> {
    return this.listPage<DatabaseUserAttributes>(this.basePath, options);
  }

  /**
   * Iterate over all database users across all pages.
   *
   * @example
   * ```ts
   * for await (const user of forge.server(123).databaseUsers.all()) {
   *   console.log(user);
   * }
   *
   * // Or collect all at once:
   * const users = await forge.server(123).databaseUsers.all().toArray();
   * ```
   */
  all(
    options: AllOptions<DatabaseUserListOptions> = {},
  ): AsyncPaginatedIterator<DatabaseUserAttributes & { id: number }> {
    return this.iterate<DatabaseUserAttributes>(this.basePath, options);
  }

  /**
   * Get a specific database user.
   *
   * @example
   * ```ts
   * const user = await forge.server(123).databaseUsers.get(789);
   * ```
   */
  async get(userId: number): Promise<DatabaseUserAttributes & { id: number }> {
    const response = await this.client.get<JsonApiDocument<DatabaseUserAttributes>>(
      `${this.basePath}/${userId}`,
    );
    return unwrapDocument(response);
  }

  /**
   * Create a new database user.
   *
   * @example
   * ```ts
   * const user = await forge.server(123).databaseUsers.create({
   *   name: 'forge',
   *   password: 'secret',
   *   databases: [1, 2],
   * });
   * ```
   */
  async create(data: CreateDatabaseUserData): Promise<DatabaseUserAttributes & { id: number }> {
    const response = await this.client.post<JsonApiDocument<DatabaseUserAttributes>>(
      this.basePath,
      data,
    );
    return unwrapDocument(response);
  }

  /**
   * Delete a database user.
   *
   * @example
   * ```ts
   * await forge.server(123).databaseUsers.delete(789);
   * ```
   */
  async delete(userId: number): Promise<void> {
    await this.client.delete(`${this.basePath}/${userId}`);
  }

  /**
   * Update a database user: its password or the databases that it can access.
   *
   * @example
   * ```ts
   * await forge.server(123).databaseUsers.update(456, { database_ids: [7, 8] });
   * ```
   */
  async update(userId: number, data: UpdateDatabaseUserData): Promise<void> {
    await this.client.put(`${this.basePath}/${userId}`, data);
  }
}
