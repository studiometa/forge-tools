import type {
  CommandResponse,
  CommandsResponse,
  CreateCommandData,
  ForgeCommand,
  HttpClient,
} from "@studiometa/forge-api";

import { BaseCollection } from "./base.ts";
import { AsyncPaginatedIterator } from "../pagination.ts";

/**
 * Options for listing site commands.
 */
export interface CommandListOptions {
  /** Page number to fetch (1-indexed). */
  page?: number;
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
    private readonly serverId: number,
    private readonly siteId: number,
  ) {
    super(client);
  }

  private get basePath(): string {
    return `/servers/${this.serverId}/sites/${this.siteId}/commands`;
  }

  /**
   * List commands run on this site.
   *
   * @example
   * ```ts
   * const commands = await forge.server(123).site(456).commands.list();
   *
   * // Fetch a specific page:
   * const page2 = await forge.server(123).site(456).commands.list({ page: 2 });
   * ```
   */
  async list(options: CommandListOptions = {}): Promise<ForgeCommand[]> {
    const query = options.page !== undefined ? `?page=${options.page}` : "";
    const response = await this.client.get<CommandsResponse>(`${this.basePath}${query}`);
    return response.commands;
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
  all(options: Omit<CommandListOptions, "page"> = {}): AsyncPaginatedIterator<ForgeCommand> {
    return new AsyncPaginatedIterator<ForgeCommand>((page) => this.list({ ...options, page }));
  }

  /**
   * Get a specific command.
   *
   * @example
   * ```ts
   * const command = await forge.server(123).site(456).commands.get(789);
   * ```
   */
  async get(commandId: number): Promise<ForgeCommand> {
    const response = await this.client.get<CommandResponse>(`${this.basePath}/${commandId}`);
    return response.command;
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
  async create(data: CreateCommandData): Promise<ForgeCommand> {
    const response = await this.client.post<CommandResponse>(this.basePath, data);
    return response.command;
  }
}
