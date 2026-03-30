import type { ForgeOptions, JsonApiDocument, UserAttributes } from "@studiometa/forge-api";

import { HttpClient, unwrapDocument } from "@studiometa/forge-api";

import { ServersCollection, ServerResource } from "./resources/servers.ts";
import { RecipesCollection } from "./resources/recipes.ts";

/**
 * Laravel Forge TypeScript SDK.
 *
 * Provides a fluent, chainable API for managing Laravel Forge servers,
 * sites, deployments, and more.
 *
 * @example
 * ```ts
 * import { Forge } from '@studiometa/forge-sdk';
 *
 * const forge = new Forge('your-api-token', 'my-org');
 *
 * // List all servers
 * const servers = await forge.servers.list();
 *
 * // Deploy a site
 * await forge.server(123).site(456).deploy();
 *
 * // Get environment variables
 * const env = await forge.server(123).site(456).env.get();
 *
 * // Manage databases
 * const dbs = await forge.server(123).databases.list();
 * ```
 */
export class Forge {
  /** @internal */
  readonly client: HttpClient;

  /** The organization slug used for v2 API URL prefixing. */
  readonly organizationSlug: string;

  /** Server operations (list, get, create, update, delete, reboot). */
  readonly servers: ServersCollection;

  /** Recipe operations (list, get, create, delete, run). */
  readonly recipes: RecipesCollection;

  /**
   * Create a new Forge SDK instance.
   *
   * @param token Your Laravel Forge API token.
   * @param organizationSlug Your organization slug (used for v2 API URLs).
   * @param options Optional configuration (custom fetch, base URL, rate limiting).
   *
   * @example
   * ```ts
   * // Basic usage
   * const forge = new Forge('your-api-token', 'my-org');
   *
   * // With custom options
   * const forge = new Forge('your-api-token', 'my-org', {
   *   baseUrl: 'https://forge.laravel.com/api/v2',
   * });
   *
   * // With mock fetch for testing
   * const forge = new Forge('test-token', 'test-org', { fetch: mockFetch });
   * ```
   */
  constructor(token: string, organizationSlug: string, options?: ForgeOptions) {
    this.client = new HttpClient({ token, ...options });
    this.organizationSlug = organizationSlug;
    this.servers = new ServersCollection(this.client, organizationSlug);
    this.recipes = new RecipesCollection(this.client, organizationSlug);
  }

  /**
   * Access a specific server by ID, with nested resources.
   *
   * Returns a `ServerResource` that provides access to sites, databases,
   * daemons, and other server-level resources.
   *
   * @param serverId The server ID.
   *
   * @example
   * ```ts
   * // List sites on a server
   * const sites = await forge.server(123).sites.list();
   *
   * // Access a specific site
   * const site = await forge.server(123).site(456);
   *
   * // Deploy a site
   * await forge.server(123).site(456).deploy();
   *
   * // Manage databases
   * const dbs = await forge.server(123).databases.list();
   * ```
   */
  server(serverId: number): ServerResource {
    return new ServerResource(this.client, this.organizationSlug, serverId);
  }

  /**
   * Get the currently authenticated user.
   *
   * @example
   * ```ts
   * const user = await forge.user();
   * console.log(user.name, user.email);
   * ```
   */
  async user(): Promise<UserAttributes & { id: number }> {
    const response = await this.client.get<JsonApiDocument<UserAttributes>>("/user");
    return unwrapDocument(response);
  }
}
