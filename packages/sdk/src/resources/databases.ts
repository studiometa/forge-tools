import type {
  CreateDatabaseData,
  ForgeDatabase,
  HttpClient,
  DatabaseResponse,
  DatabasesResponse,
} from "@studiometa/forge-api";

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
export class DatabasesCollection {
  /** @internal */
  constructor(
    private readonly client: HttpClient,
    private readonly serverId: number,
  ) {}

  private get basePath(): string {
    return `/servers/${this.serverId}/databases`;
  }

  /**
   * List all databases on this server.
   *
   * @example
   * ```ts
   * const dbs = await forge.server(123).databases.list();
   * ```
   */
  async list(): Promise<ForgeDatabase[]> {
    const response = await this.client.get<DatabasesResponse>(this.basePath);
    return response.databases;
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
