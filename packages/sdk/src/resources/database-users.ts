import type {
  CreateDatabaseUserData,
  DatabaseUserResponse,
  DatabaseUsersResponse,
  ForgeDatabaseUser,
  HttpClient,
} from "@studiometa/forge-api";

import { BaseCollection } from "./base.ts";
import { AsyncPaginatedIterator } from "../pagination.ts";

/**
 * Options for listing database users.
 */
export interface DatabaseUserListOptions {
  /** Page number to fetch (1-indexed). */
  page?: number;
}

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
    private readonly serverId: number,
  ) {
    super(client);
  }

  private get basePath(): string {
    return `/servers/${this.serverId}/database-users`;
  }

  /**
   * List database users on this server.
   *
   * @example
   * ```ts
   * const users = await forge.server(123).databaseUsers.list();
   *
   * // Fetch a specific page:
   * const page2 = await forge.server(123).databaseUsers.list({ page: 2 });
   * ```
   */
  async list(options: DatabaseUserListOptions = {}): Promise<ForgeDatabaseUser[]> {
    const query = options.page !== undefined ? `?page=${options.page}` : "";
    const response = await this.client.get<DatabaseUsersResponse>(`${this.basePath}${query}`);
    return response.users;
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
    options: Omit<DatabaseUserListOptions, "page"> = {},
  ): AsyncPaginatedIterator<ForgeDatabaseUser> {
    return new AsyncPaginatedIterator<ForgeDatabaseUser>((page) => this.list({ ...options, page }));
  }

  /**
   * Get a specific database user.
   *
   * @example
   * ```ts
   * const user = await forge.server(123).databaseUsers.get(789);
   * ```
   */
  async get(userId: number): Promise<ForgeDatabaseUser> {
    const response = await this.client.get<DatabaseUserResponse>(`${this.basePath}/${userId}`);
    return response.user;
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
  async create(data: CreateDatabaseUserData): Promise<ForgeDatabaseUser> {
    const response = await this.client.post<DatabaseUserResponse>(this.basePath, data);
    return response.user;
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
}
