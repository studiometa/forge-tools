import type { EventAttributes, HttpClient, OutputAttributes } from "@studiometa/forge-api";

import type { AllOptions, ListOptions } from "../list-options.ts";
import type { AsyncPaginatedIterator } from "../pagination.ts";

import { BaseCollection } from "./base.ts";

/** Options for listing events. */
export type EventListOptions = ListOptions<
  "initiated_by" | "ran_as",
  "created_at" | "updated_at",
  "initiator" | "initiatorCount" | "initiatorExists" | "site" | "siteCount" | "siteExists"
>;

/**
 * Recent events of the organization: what ran on its servers, and who started it.
 *
 * Access via `forge.events`, or `forge.server(id).events` for the events of a server.
 *
 * @example
 * ```ts
 * const events = await forge.events.list({ sort: ['-created_at'] });
 * ```
 */
export class EventsCollection extends BaseCollection {
  /** @internal */
  protected get basePath(): string {
    return `/orgs/${this.orgSlug}/events`;
  }

  /**
   * List events.
   *
   * @example
   * ```ts
   * const events = await forge.events.list({ filter: { ran_as: 'forge' } });
   * ```
   */
  async list(options: EventListOptions = {}): Promise<Array<EventAttributes & { id: number }>> {
    return this.listPage<EventAttributes>(this.basePath, options);
  }

  /**
   * Iterate over all events across all pages.
   *
   * @example
   * ```ts
   * for await (const event of forge.events.all()) {
   *   console.log(event.description);
   * }
   * ```
   */
  all(
    options: AllOptions<EventListOptions> = {},
  ): AsyncPaginatedIterator<EventAttributes & { id: number }> {
    return this.iterate<EventAttributes>(this.basePath, options);
  }
}

/**
 * Events of a server, with their output.
 *
 * Access via `forge.server(id).events`.
 *
 * @example
 * ```ts
 * const output = await forge.server(123).events.output(456);
 * ```
 */
export class ServerEventsCollection extends EventsCollection {
  /** @internal */
  constructor(
    client: HttpClient,
    orgSlug: string,
    private readonly serverId: number,
  ) {
    super(client, orgSlug);
  }

  /** @internal */
  protected override get basePath(): string {
    return `/orgs/${this.orgSlug}/servers/${this.serverId}/events`;
  }

  /**
   * Get an event of the server.
   *
   * @example
   * ```ts
   * const event = await forge.server(123).events.get(456);
   * ```
   */
  async get(eventId: number): Promise<EventAttributes & { id: number }> {
    return this.getResource<EventAttributes>(`${this.basePath}/${eventId}`);
  }

  /**
   * Get the output of an event of the server.
   *
   * @example
   * ```ts
   * const output = await forge.server(123).events.output(456);
   * ```
   */
  async output(eventId: number): Promise<string> {
    return (await this.getResource<OutputAttributes>(`${this.basePath}/${eventId}/output`)).output;
  }
}
