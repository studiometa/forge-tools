import type {
  CreateDatabaseUserData,
  HttpClient,
  JsonApiDocument,
  JsonApiListDocument,
  DatabaseUserAttributes,
} from "@studiometa/forge-api";

import { unwrapDocument, unwrapListDocument } from "@studiometa/forge-api";

import { BaseCollection } from "./base.ts";
import { AsyncPaginatedIterator } from "../pagination.ts";

/**
 * Options for listing database users.
 */
export interface DatabaseUserListOptions {
  /** Cursor for pagination (from previous response's next_cursor). */
  cursor?: string;
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
    const query = options.cursor !== undefined ? `?page[cursor]=${options.cursor}` : "";
    const response = await this.client.get<JsonApiListDocument<DatabaseUserAttributes>>(
      `${this.basePath}${query}`,
    );
    return unwrapListDocument(response);
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
  all(): AsyncPaginatedIterator<DatabaseUserAttributes & { id: number }> {
    return new AsyncPaginatedIterator<DatabaseUserAttributes & { id: number }>(async (cursor) => {
      const query = cursor !== null ? `?page[cursor]=${cursor}` : "";
      const response = await this.client.get<JsonApiListDocument<DatabaseUserAttributes>>(
        `${this.basePath}${query}`,
      );
      return {
        items: unwrapListDocument(response),
        nextCursor: response.meta.next_cursor ?? null,
      };
    });
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
}
