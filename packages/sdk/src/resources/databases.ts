import type {
  CreateDatabaseData,
  ForgeDatabase,
  HttpClient,
  DatabaseResponse,
  DatabasesResponse,
} from "@studiometa/forge-api";

import { BaseCollection } from "./base.ts";
import { AsyncPaginatedIterator } from "../pagination.ts";

/**
 * Options for listing databases.
 */
export interface DatabaseListOptions {
  /** Page number to fetch (1-indexed). */
  page?: number;
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
    private readonly serverId: number,
  ) {
    super(client);
  }

  private get basePath(): string {
    return `/servers/${this.serverId}/databases`;
  }

  /**
   * List databases on this server.
   *
   * @example
   * ```ts
   * const dbs = await forge.server(123).databases.list();
   *
   * // Fetch a specific page:
   * const page2 = await forge.server(123).databases.list({ page: 2 });
   * ```
   */
  async list(options: DatabaseListOptions = {}): Promise<ForgeDatabase[]> {
    const query = options.page !== undefined ? `?page=${options.page}` : "";
    const response = await this.client.get<DatabasesResponse>(`${this.basePath}${query}`);
    return response.databases;
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
  all(options: Omit<DatabaseListOptions, "page"> = {}): AsyncPaginatedIterator<ForgeDatabase> {
    return new AsyncPaginatedIterator<ForgeDatabase>((page) => this.list({ ...options, page }));
  }

  /**
   * Get a specific database.
   *
   * @example
   * ```ts
   * const db = await forge.server(123).databases.get(789);
   * ```
   */
  async get(databaseId: number): Promise<ForgeDatabase> {
    const response = await this.client.get<DatabaseResponse>(`${this.basePath}/${databaseId}`);
    return response.database;
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
  async create(data: CreateDatabaseData): Promise<ForgeDatabase> {
    const response = await this.client.post<DatabaseResponse>(this.basePath, data);
    return response.database;
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
