import type {
  HttpClient,
  JsonApiListDocument,
  ServerAttributes,
  TeamAttributes,
} from "@studiometa/forge-api";

import { unwrapListDocument } from "@studiometa/forge-api";

import { BaseCollection } from "./base.ts";
import { AsyncPaginatedIterator } from "../pagination.ts";

/**
 * Options for listing teams.
 */
export interface TeamListOptions {
  /** Cursor for pagination (from previous response's next_cursor). */
  cursor?: string;
}

/**
 * Options for listing the servers of a team.
 */
export interface TeamServerListOptions {
  /** Cursor for pagination (from previous response's next_cursor). */
  cursor?: string;
}

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
    const query = options.cursor !== undefined ? `?page[cursor]=${options.cursor}` : "";
    const response = await this.client.get<JsonApiListDocument<TeamAttributes>>(
      `${this.basePath}${query}`,
    );
    return unwrapListDocument(response);
  }

  /**
   * Iterate over all teams across all pages.
   *
   * @example
   * ```ts
   * const teams = await forge.teams.all().toArray();
   * ```
   */
  all(): AsyncPaginatedIterator<TeamAttributes & { id: number }> {
    return new AsyncPaginatedIterator<TeamAttributes & { id: number }>(async (cursor) => {
      const query = cursor !== null ? `?page[cursor]=${cursor}` : "";
      const response = await this.client.get<JsonApiListDocument<TeamAttributes>>(
        `${this.basePath}${query}`,
      );
      return {
        items: unwrapListDocument(response),
        nextCursor: response.meta.next_cursor ?? null,
      };
    });
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
    const query = options.cursor !== undefined ? `?page[cursor]=${options.cursor}` : "";
    const response = await this.client.get<JsonApiListDocument<ServerAttributes>>(
      `${this.basePath}${query}`,
    );
    return unwrapListDocument(response);
  }

  /**
   * Iterate over all the servers shared with the team, across all pages.
   *
   * @example
   * ```ts
   * const servers = await forge.team(17).servers.all().toArray();
   * ```
   */
  all(): AsyncPaginatedIterator<ServerAttributes & { id: number }> {
    return new AsyncPaginatedIterator<ServerAttributes & { id: number }>(async (cursor) => {
      const query = cursor !== null ? `?page[cursor]=${cursor}` : "";
      const response = await this.client.get<JsonApiListDocument<ServerAttributes>>(
        `${this.basePath}${query}`,
      );
      return {
        items: unwrapListDocument(response),
        nextCursor: response.meta.next_cursor ?? null,
      };
    });
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
 * A specific team, with nested resources.
 *
 * Access via `forge.team(teamId)`.
 *
 * @example
 * ```ts
 * await forge.team(17).servers.add(123);
 * ```
 */
export class TeamResource extends BaseCollection {
  /** Servers shared with this team. */
  readonly servers: TeamServersCollection;

  /** @internal */
  constructor(client: HttpClient, orgSlug: string, teamId: number) {
    super(client, orgSlug);
    this.servers = new TeamServersCollection(client, orgSlug, teamId);
  }
}
