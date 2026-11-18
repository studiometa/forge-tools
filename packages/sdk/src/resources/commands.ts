import type {
  CreateCommandData,
  HttpClient,
  JsonApiDocument,
  CommandAttributes,
  OutputAttributes,
} from "@studiometa/forge-api";

import { unwrapDocument } from "@studiometa/forge-api";

import type { AllOptions, ListOptions } from "../list-options.ts";

import { BaseCollection } from "./base.ts";
import { AsyncPaginatedIterator } from "../pagination.ts";

/**
 * Options for listing site commands.
 */
export type CommandListOptions = ListOptions<
  "user_id" | "status" | "command",
  "status" | "created_at" | "updated_at"
>;

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
    return this.listPage<CommandAttributes>(this.basePath, options);
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
  all(
    options: AllOptions<CommandListOptions> = {},
  ): AsyncPaginatedIterator<CommandAttributes & { id: number }> {
    return this.iterate<CommandAttributes>(this.basePath, options);
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
   * Forge answers `202 Accepted` without a body: the command runs in the background.
   * Use `list()` to find it and read its status.
   *
   * @example
   * ```ts
   * await forge.server(123).site(456).commands.create({
   *   command: 'php artisan migrate',
   * });
   * ```
   */
  async create(data: CreateCommandData): Promise<void> {
    await this.client.post(this.basePath, data);
  }

  /**
   * Delete a command from the history of the site.
   *
   * @example
   * ```ts
   * await forge.server(123).site(456).commands.delete(789);
   * ```
   */
  async delete(commandId: number): Promise<void> {
    await this.client.delete(`${this.basePath}/${commandId}`);
  }

  /**
   * Get the output of a command.
   *
   * @example
   * ```ts
   * const output = await forge.server(123).site(456).commands.output(789);
   * ```
   */
  async output(commandId: number): Promise<string> {
    return (await this.getResource<OutputAttributes>(`${this.basePath}/${commandId}/output`))
      .output;
  }
}
