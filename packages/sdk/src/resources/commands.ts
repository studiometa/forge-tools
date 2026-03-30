import type {
  CreateCommandData,
  HttpClient,
  JsonApiDocument,
  JsonApiListDocument,
  CommandAttributes,
} from "@studiometa/forge-api";

import { unwrapDocument, unwrapListDocument } from "@studiometa/forge-api";

import { BaseCollection } from "./base.ts";
import { AsyncPaginatedIterator } from "../pagination.ts";

/**
 * Options for listing site commands.
 */
export interface CommandListOptions {
  /** Cursor for pagination (from previous response's next_cursor). */
  cursor?: string;
}

/**
 * Collection of commands run on a site.
 *
 * Access via `forge.server(id).site(id).commands`.
 *
 * @example
 * ```ts
 * const commands = await forge.server(123).site(456).commands.list();
 * ```
 */
export class CommandsCollection extends BaseCollection {
  /** @internal */
  constructor(
    client: HttpClient,
    orgSlug: string,
    private readonly serverId: number,
    private readonly siteId: number,
  ) {
    super(client, orgSlug);
  }

  private get basePath(): string {
    return `/orgs/${this.orgSlug}/servers/${this.serverId}/sites/${this.siteId}/commands`;
  }

  /**
   * List commands run on this site.
   *
   * @example
   * ```ts
   * const commands = await forge.server(123).site(456).commands.list();
   *
   * // Fetch a specific cursor page:
   * const page2 = await forge.server(123).site(456).commands.list({ cursor: 'next-cursor-value' });
   * ```
   */
  async list(options: CommandListOptions = {}): Promise<Array<CommandAttributes & { id: number }>> {
    const query = options.cursor !== undefined ? `?page[cursor]=${options.cursor}` : "";
    const response = await this.client.get<JsonApiListDocument<CommandAttributes>>(
      `${this.basePath}${query}`,
    );
    return unwrapListDocument(response);
  }

  /**
   * Iterate over all commands across all pages.
   *
   * @example
   * ```ts
   * for await (const command of forge.server(123).site(456).commands.all()) {
   *   console.log(command);
   * }
   *
   * // Or collect all at once:
   * const commands = await forge.server(123).site(456).commands.all().toArray();
   * ```
   */
  all(): AsyncPaginatedIterator<CommandAttributes & { id: number }> {
    return new AsyncPaginatedIterator<CommandAttributes & { id: number }>(async (cursor) => {
      const query = cursor !== null ? `?page[cursor]=${cursor}` : "";
      const response = await this.client.get<JsonApiListDocument<CommandAttributes>>(
        `${this.basePath}${query}`,
      );
      return {
        items: unwrapListDocument(response),
        nextCursor: response.meta.next_cursor ?? null,
      };
    });
  }

  /**
   * Get a specific command.
   *
   * @example
   * ```ts
   * const command = await forge.server(123).site(456).commands.get(789);
   * ```
   */
  async get(commandId: number): Promise<CommandAttributes & { id: number }> {
    const response = await this.client.get<JsonApiDocument<CommandAttributes>>(
      `${this.basePath}/${commandId}`,
    );
    return unwrapDocument(response);
  }

  /**
   * Run a command on this site.
   *
   * @example
   * ```ts
   * const command = await forge.server(123).site(456).commands.create({
   *   command: 'php artisan migrate',
   * });
   * ```
   */
  async create(data: CreateCommandData): Promise<CommandAttributes & { id: number }> {
    const response = await this.client.post<JsonApiDocument<CommandAttributes>>(
      this.basePath,
      data,
    );
    return unwrapDocument(response);
  }
}
