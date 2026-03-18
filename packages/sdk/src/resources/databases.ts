import type {
  CreateDatabaseData,
  HttpClient,
  JsonApiDocument,
  JsonApiListDocument,
  DatabaseAttributes,
} from "@studiometa/forge-api";

import { unwrapDocument, unwrapListDocument } from "@studiometa/forge-api";

import { BaseCollection } from "./base.ts";
import { AsyncPaginatedIterator } from "../pagination.ts";

/**
 * Options for listing databases.
 */
export interface DatabaseListOptions {
  /** Cursor for pagination (from previous response's next_cursor). */
  cursor?: string;
}

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
    const query = options.cursor !== undefined ? `?page[cursor]=${options.cursor}` : "";
    const response = await this.client.get<JsonApiListDocument<DatabaseAttributes>>(
      `${this.basePath}${query}`,
    );
    return unwrapListDocument(response);
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
  all(): AsyncPaginatedIterator<DatabaseAttributes & { id: number }> {
    return new AsyncPaginatedIterator<DatabaseAttributes & { id: number }>(async (cursor) => {
      const query = cursor !== null ? `?page[cursor]=${cursor}` : "";
      const response = await this.client.get<JsonApiListDocument<DatabaseAttributes>>(
        `${this.basePath}${query}`,
      );
      return {
        items: unwrapListDocument(response),
        nextCursor: response.meta.next_cursor ?? null,
      };
    });
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
}
