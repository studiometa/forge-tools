import type {
  CreateTeamData,
  CreateTeamInviteData,
  HttpClient,
  MembershipAttributes,
  RecipeAttributes,
  ServerAttributes,
  ServerCredentialAttributes,
  TeamAttributes,
  TeamInvitationAttributes,
  UpdateTeamData,
} from "@studiometa/forge-api";

import type { AllOptions, ListOptions } from "../list-options.ts";

import { BaseCollection } from "./base.ts";
import type { AsyncPaginatedIterator } from "../pagination.ts";

/**
 * Options for listing teams.
 */
export type TeamListOptions = ListOptions;

/**
 * Options for listing the servers of a team.
 */
export type TeamServerListOptions = ListOptions;

/** Options for listing the members, recipes or server credentials of a team. */
export type TeamItemListOptions = ListOptions;

/** Options for listing the invitations of a team. */
export type TeamInvitationListOptions = ListOptions<
  never,
  never,
  | "role"
  | "roleCount"
  | "roleExists"
  | "team"
  | "teamCount"
  | "teamExists"
  | "organization"
  | "organizationCount"
  | "organizationExists"
>;

/**
 * Collection of the organization's teams.
 *
 * Access via `forge.teams`.
 *
 * @example
 * ```ts
 * const teams = await forge.teams.list();
 * ```
 */
export class TeamsCollection extends BaseCollection {
  /** @internal */
  private get basePath(): string {
    return `/orgs/${this.orgSlug}/teams`;
  }

  /**
   * List teams.
   *
   * @example
   * ```ts
   * const teams = await forge.teams.list();
   *
   * // Fetch a specific cursor page:
   * const page2 = await forge.teams.list({ cursor: 'next-cursor-value' });
   * ```
   */
  async list(options: TeamListOptions = {}): Promise<Array<TeamAttributes & { id: number }>> {
    return this.listPage<TeamAttributes>(this.basePath, options);
  }

  /**
   * Iterate over all teams across all pages.
   *
   * @example
   * ```ts
   * const teams = await forge.teams.all().toArray();
   * ```
   */
  all(
    options: AllOptions<TeamListOptions> = {},
  ): AsyncPaginatedIterator<TeamAttributes & { id: number }> {
    return this.iterate<TeamAttributes>(this.basePath, options);
  }

  /**
   * Get a team.
   *
   * @example
   * ```ts
   * const team = await forge.teams.get(17);
   * ```
   */
  async get(teamId: number): Promise<TeamAttributes & { id: number }> {
    return this.getResource<TeamAttributes>(`${this.basePath}/${teamId}`);
  }

  /**
   * Create a team, with its members and invitations.
   *
   * @example
   * ```ts
   * const team = await forge.teams.create({ name: 'Developers' });
   * ```
   */
  async create(data: CreateTeamData): Promise<TeamAttributes & { id: number }> {
    return this.postResource<TeamAttributes>(this.basePath, data);
  }

  /**
   * Update a team: its name and the roles of its members.
   *
   * @example
   * ```ts
   * const team = await forge.teams.update(17, { name: 'Developers' });
   * ```
   */
  async update(teamId: number, data: UpdateTeamData): Promise<TeamAttributes & { id: number }> {
    return this.putResource<TeamAttributes>(`${this.basePath}/${teamId}`, data);
  }

  /**
   * Delete a team.
   *
   * @example
   * ```ts
   * await forge.teams.delete(17);
   * ```
   */
  async delete(teamId: number): Promise<void> {
    await this.client.delete(`${this.basePath}/${teamId}`);
  }
}

/**
 * Collection of the servers shared with a team.
 *
 * Access via `forge.team(teamId).servers`.
 *
 * @example
 * ```ts
 * const servers = await forge.team(17).servers.list();
 * await forge.team(17).servers.add(123);
 * ```
 */
export class TeamServersCollection extends BaseCollection {
  /** @internal */
  constructor(
    client: HttpClient,
    orgSlug: string,
    private readonly teamId: number,
  ) {
    super(client, orgSlug);
  }

  /** @internal */
  private get basePath(): string {
    return `/orgs/${this.orgSlug}/teams/${this.teamId}/servers`;
  }

  /**
   * List the servers shared with the team.
   *
   * @example
   * ```ts
   * const servers = await forge.team(17).servers.list();
   *
   * // Fetch a specific cursor page:
   * const page2 = await forge.team(17).servers.list({ cursor: 'next-cursor-value' });
   * ```
   */
  async list(
    options: TeamServerListOptions = {},
  ): Promise<Array<ServerAttributes & { id: number }>> {
    return this.listPage<ServerAttributes>(this.basePath, options);
  }

  /**
   * Iterate over all the servers shared with the team, across all pages.
   *
   * @example
   * ```ts
   * const servers = await forge.team(17).servers.all().toArray();
   * ```
   */
  all(
    options: AllOptions<TeamServerListOptions> = {},
  ): AsyncPaginatedIterator<ServerAttributes & { id: number }> {
    return this.iterate<ServerAttributes>(this.basePath, options);
  }

  /**
   * Share a server with the team.
   *
   * @example
   * ```ts
   * await forge.team(17).servers.add(123);
   * ```
   */
  async add(serverId: number): Promise<void> {
    await this.client.post(this.basePath, { server_id: serverId });
  }

  /**
   * Stop sharing a server with the team.
   *
   * @example
   * ```ts
   * await forge.team(17).servers.remove(123);
   * ```
   */
  async remove(serverId: number): Promise<void> {
    await this.client.delete(`${this.basePath}/${serverId}`);
  }
}

/**
 * Base of the collections of one team.
 */
abstract class TeamScoped extends BaseCollection {
  /** @internal */
  constructor(
    client: HttpClient,
    orgSlug: string,
    protected readonly teamId: number,
  ) {
    super(client, orgSlug);
  }

  /** @internal */
  protected get teamPath(): string {
    return `/orgs/${this.orgSlug}/teams/${this.teamId}`;
  }
}

/**
 * The members of a team.
 *
 * Access via `forge.team(id).members`.
 *
 * @example
 * ```ts
 * const members = await forge.team(17).members.list();
 * ```
 */
export class TeamMembersCollection extends TeamScoped {
  /** @internal */
  private get basePath(): string {
    return `${this.teamPath}/members`;
  }

  /**
   * List the members of the team.
   *
   * @example
   * ```ts
   * const members = await forge.team(17).members.list();
   * ```
   */
  async list(
    options: TeamItemListOptions = {},
  ): Promise<Array<MembershipAttributes & { id: number }>> {
    return this.listPage<MembershipAttributes>(this.basePath, options);
  }

  /**
   * Iterate over all the members of the team.
   *
   * @example
   * ```ts
   * const members = await forge.team(17).members.all().toArray();
   * ```
   */
  all(
    options: AllOptions<TeamItemListOptions> = {},
  ): AsyncPaginatedIterator<MembershipAttributes & { id: number }> {
    return this.iterate<MembershipAttributes>(this.basePath, options);
  }

  /**
   * Get a member of the team.
   *
   * @example
   * ```ts
   * const member = await forge.team(17).members.get(42);
   * ```
   */
  async get(userId: number): Promise<MembershipAttributes & { id: number }> {
    return this.getResource<MembershipAttributes>(`${this.basePath}/${userId}`);
  }

  /**
   * Change the role of a member of the team.
   *
   * @example
   * ```ts
   * await forge.team(17).members.update(42, 3);
   * ```
   */
  async update(userId: number, roleId: number): Promise<MembershipAttributes & { id: number }> {
    return this.putResource<MembershipAttributes>(`${this.basePath}/${userId}`, {
      role_id: roleId,
    });
  }

  /**
   * Remove a member from the team.
   *
   * @example
   * ```ts
   * await forge.team(17).members.remove(42);
   * ```
   */
  async remove(userId: number): Promise<void> {
    await this.client.delete(`${this.basePath}/${userId}`);
  }
}

/**
 * The pending invitations of a team.
 *
 * Access via `forge.team(id).invites`.
 *
 * @example
 * ```ts
 * await forge.team(17).invites.create({ email: 'jane@example.com', role_id: 3 });
 * ```
 */
export class TeamInvitesCollection extends TeamScoped {
  /** @internal */
  private get basePath(): string {
    return `${this.teamPath}/invites`;
  }

  /**
   * List the invitations of the team.
   *
   * @example
   * ```ts
   * const invites = await forge.team(17).invites.list({ include: ['role'] });
   * ```
   */
  async list(
    options: TeamInvitationListOptions = {},
  ): Promise<Array<TeamInvitationAttributes & { id: number }>> {
    return this.listPage<TeamInvitationAttributes>(this.basePath, options);
  }

  /**
   * Iterate over all the invitations of the team.
   *
   * @example
   * ```ts
   * const invites = await forge.team(17).invites.all().toArray();
   * ```
   */
  all(
    options: AllOptions<TeamInvitationListOptions> = {},
  ): AsyncPaginatedIterator<TeamInvitationAttributes & { id: number }> {
    return this.iterate<TeamInvitationAttributes>(this.basePath, options);
  }

  /**
   * Get an invitation of the team.
   *
   * @example
   * ```ts
   * const invite = await forge.team(17).invites.get(5);
   * ```
   */
  async get(invitationId: number): Promise<TeamInvitationAttributes & { id: number }> {
    return this.getResource<TeamInvitationAttributes>(`${this.basePath}/${invitationId}`);
  }

  /**
   * Invite a user to the team, with a role.
   *
   * @example
   * ```ts
   * await forge.team(17).invites.create({ email: 'jane@example.com', role_id: 3 });
   * ```
   */
  async create(data: CreateTeamInviteData): Promise<TeamInvitationAttributes & { id: number }> {
    return this.postResource<TeamInvitationAttributes>(this.basePath, data);
  }

  /**
   * Cancel an invitation of the team.
   *
   * @example
   * ```ts
   * await forge.team(17).invites.delete(5);
   * ```
   */
  async delete(invitationId: number): Promise<void> {
    await this.client.delete(`${this.basePath}/${invitationId}`);
  }
}

/**
 * The recipes shared with a team.
 *
 * Access via `forge.team(id).recipes`.
 *
 * @example
 * ```ts
 * await forge.team(17).recipes.add(3);
 * ```
 */
export class TeamRecipesCollection extends TeamScoped {
  /** @internal */
  private get basePath(): string {
    return `${this.teamPath}/recipes`;
  }

  /**
   * List the recipes shared with the team.
   *
   * @example
   * ```ts
   * const recipes = await forge.team(17).recipes.list();
   * ```
   */
  async list(options: TeamItemListOptions = {}): Promise<Array<RecipeAttributes & { id: number }>> {
    return this.listPage<RecipeAttributes>(this.basePath, options);
  }

  /**
   * Iterate over all the recipes shared with the team.
   *
   * @example
   * ```ts
   * const recipes = await forge.team(17).recipes.all().toArray();
   * ```
   */
  all(
    options: AllOptions<TeamItemListOptions> = {},
  ): AsyncPaginatedIterator<RecipeAttributes & { id: number }> {
    return this.iterate<RecipeAttributes>(this.basePath, options);
  }

  /**
   * Share a recipe with the team.
   *
   * @example
   * ```ts
   * await forge.team(17).recipes.add(3);
   * ```
   */
  async add(recipeId: number): Promise<RecipeAttributes & { id: number }> {
    return this.postResource<RecipeAttributes>(this.basePath, { recipe_id: recipeId });
  }

  /**
   * Stop sharing a recipe with the team.
   *
   * @example
   * ```ts
   * await forge.team(17).recipes.remove(3);
   * ```
   */
  async remove(recipeId: number): Promise<void> {
    await this.client.delete(`${this.basePath}/${recipeId}`);
  }
}

/**
 * The server provider credentials shared with a team.
 *
 * Access via `forge.team(id).serverCredentials`.
 *
 * @example
 * ```ts
 * await forge.team(17).serverCredentials.add(8);
 * ```
 */
export class TeamServerCredentialsCollection extends TeamScoped {
  /** @internal */
  private get basePath(): string {
    return `${this.teamPath}/server-credentials`;
  }

  /**
   * List the server credentials shared with the team.
   *
   * @example
   * ```ts
   * const credentials = await forge.team(17).serverCredentials.list();
   * ```
   */
  async list(
    options: TeamItemListOptions = {},
  ): Promise<Array<ServerCredentialAttributes & { id: number }>> {
    return this.listPage<ServerCredentialAttributes>(this.basePath, options);
  }

  /**
   * Iterate over all the server credentials shared with the team.
   *
   * @example
   * ```ts
   * const credentials = await forge.team(17).serverCredentials.all().toArray();
   * ```
   */
  all(
    options: AllOptions<TeamItemListOptions> = {},
  ): AsyncPaginatedIterator<ServerCredentialAttributes & { id: number }> {
    return this.iterate<ServerCredentialAttributes>(this.basePath, options);
  }

  /**
   * Share a server credential with the team.
   *
   * @example
   * ```ts
   * await forge.team(17).serverCredentials.add(8);
   * ```
   */
  async add(credentialId: number): Promise<ServerCredentialAttributes & { id: number }> {
    return this.postResource<ServerCredentialAttributes>(this.basePath, {
      credential_id: credentialId,
    });
  }

  /**
   * Stop sharing a server credential with the team.
   *
   * @example
   * ```ts
   * await forge.team(17).serverCredentials.remove(8);
   * ```
   */
  async remove(credentialId: number): Promise<void> {
    await this.client.delete(`${this.basePath}/${credentialId}`);
  }
}

/**
 * A team, with the servers, recipes, credentials, members and invitations shared with it.
 *
 * Access via `forge.team(id)`.
 *
 * @example
 * ```ts
 * const servers = await forge.team(17).servers.list();
 * ```
 */
export class TeamResource extends BaseCollection {
  /** Servers shared with this team. */
  readonly servers: TeamServersCollection;

  /** Members of this team. */
  readonly members: TeamMembersCollection;

  /** Pending invitations of this team. */
  readonly invites: TeamInvitesCollection;

  /** Recipes shared with this team. */
  readonly recipes: TeamRecipesCollection;

  /** Server provider credentials shared with this team. */
  readonly serverCredentials: TeamServerCredentialsCollection;

  /** @internal */
  constructor(client: HttpClient, orgSlug: string, teamId: number) {
    super(client, orgSlug);
    this.servers = new TeamServersCollection(client, orgSlug, teamId);
    this.members = new TeamMembersCollection(client, orgSlug, teamId);
    this.invites = new TeamInvitesCollection(client, orgSlug, teamId);
    this.recipes = new TeamRecipesCollection(client, orgSlug, teamId);
    this.serverCredentials = new TeamServerCredentialsCollection(client, orgSlug, teamId);
  }
}
