import type { ForgeOptions, JsonApiDocument, UserAttributes } from "@studiometa/forge-api";

import { HttpClient, unwrapDocument } from "@studiometa/forge-api";

import { ServersCollection, ServerResource } from "./resources/servers.ts";
import { RecipesCollection } from "./resources/recipes.ts";
import { StorageProvidersCollection } from "./resources/storage-providers.ts";
import { TeamsCollection, TeamResource } from "./resources/teams.ts";
import { OrganizationsCollection } from "./resources/organizations.ts";
import { OrganizationSitesCollection } from "./resources/organization-sites.ts";
import { EventsCollection } from "./resources/events.ts";
import { ForgeRecipesCollection } from "./resources/forge-recipes.ts";
import {
  PermissionsCollection,
  PredefinedRolesCollection,
  RolesCollection,
} from "./resources/roles.ts";
import { ProviderResource, ProvidersCollection } from "./resources/providers.ts";
import { ServerCredentialsCollection } from "./resources/server-credentials.ts";

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

  /** Storage provider operations (list, get, create, delete), used by database backups. */
  readonly storageProviders: StorageProvidersCollection;

  /** Team operations. Use `forge.team(id)` for the servers, members and invitations of a team. */
  readonly teams: TeamsCollection;

  /** The organizations of the user. */
  readonly organizations: OrganizationsCollection;

  /** The sites of every server of the organization. */
  readonly sites: OrganizationSitesCollection;

  /** The recent events of the organization. */
  readonly events: EventsCollection;

  /** The recipes that Forge provides. */
  readonly forgeRecipes: ForgeRecipesCollection;

  /** The custom roles of the organization. */
  readonly roles: RolesCollection;

  /** The roles that Forge defines. */
  readonly predefinedRoles: PredefinedRolesCollection;

  /** The permissions that a role can grant. */
  readonly permissions: PermissionsCollection;

  /** The server providers. Use `forge.provider(slug)` for their regions and sizes. */
  readonly providers: ProvidersCollection;

  /** The server provider credentials of the organization. */
  readonly serverCredentials: ServerCredentialsCollection;

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
    this.storageProviders = new StorageProvidersCollection(this.client, organizationSlug);
    this.teams = new TeamsCollection(this.client, organizationSlug);
    this.organizations = new OrganizationsCollection(this.client, organizationSlug);
    this.sites = new OrganizationSitesCollection(this.client, organizationSlug);
    this.events = new EventsCollection(this.client, organizationSlug);
    this.forgeRecipes = new ForgeRecipesCollection(this.client, organizationSlug);
    this.roles = new RolesCollection(this.client, organizationSlug);
    this.predefinedRoles = new PredefinedRolesCollection(this.client, organizationSlug);
    this.permissions = new PermissionsCollection(this.client, organizationSlug);
    this.providers = new ProvidersCollection(this.client, organizationSlug);
    this.serverCredentials = new ServerCredentialsCollection(this.client, organizationSlug);
  }

  /**
   * Access a server provider by slug, with its regions and sizes.
   *
   * @param provider The provider slug, e.g. `hetzner` or `ocean2`.
   *
   * @example
   * ```ts
   * const sizes = await forge.provider('hetzner').region('fsn1').sizes();
   * ```
   */
  provider(provider: string): ProviderResource {
    return new ProviderResource(this.client, this.organizationSlug, provider);
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
   * Access a specific team by ID, with nested resources.
   *
   * @param teamId The team ID.
   *
   * @example
   * ```ts
   * // List the servers shared with a team
   * const servers = await forge.team(17).servers.list();
   *
   * // Share a server with a team
   * await forge.team(17).servers.add(123);
   * ```
   */
  team(teamId: number): TeamResource {
    return new TeamResource(this.client, this.organizationSlug, teamId);
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
