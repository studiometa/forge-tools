import type {
  CreateScheduledJobData,
  HttpClient,
  JsonApiDocument,
  JsonApiListDocument,
  ScheduledJobAttributes,
} from "@studiometa/forge-api";

import { unwrapDocument, unwrapListDocument } from "@studiometa/forge-api";

import { BaseCollection } from "./base.ts";
import { AsyncPaginatedIterator } from "../pagination.ts";

/**
 * Options for listing scheduled jobs.
 */
export interface ScheduledJobListOptions {
  /** Cursor for pagination (from previous response's next_cursor). */
  cursor?: string;
}

/**
 * Collection of scheduled jobs (cron jobs) on a server.
 *
 * Access via `forge.server(id).scheduledJobs`.
 *
 * @example
 * ```ts
 * const jobs = await forge.server(123).scheduledJobs.list();
 * ```
 */
export class ScheduledJobsCollection extends BaseCollection {
  /** @internal */
  constructor(
    client: HttpClient,
    orgSlug: string,
    private readonly serverId: number,
  ) {
    super(client, orgSlug);
  }

  private get basePath(): string {
    return `/orgs/${this.orgSlug}/servers/${this.serverId}/scheduled-jobs`;
  }

  /**
   * List scheduled jobs on this server.
   *
   * @example
   * ```ts
   * const jobs = await forge.server(123).scheduledJobs.list();
   *
   * // Fetch a specific cursor page:
   * const page2 = await forge.server(123).scheduledJobs.list({ cursor: 'next-cursor-value' });
   * ```
   */
  async list(
    options: ScheduledJobListOptions = {},
  ): Promise<Array<ScheduledJobAttributes & { id: number }>> {
    const query = options.cursor !== undefined ? `?page[cursor]=${options.cursor}` : "";
    const response = await this.client.get<JsonApiListDocument<ScheduledJobAttributes>>(
      `${this.basePath}${query}`,
    );
    return unwrapListDocument(response);
  }

  /**
   * Iterate over all scheduled jobs across all pages.
   *
   * @example
   * ```ts
   * for await (const job of forge.server(123).scheduledJobs.all()) {
   *   console.log(job);
   * }
   *
   * // Or collect all at once:
   * const jobs = await forge.server(123).scheduledJobs.all().toArray();
   * ```
   */
  all(): AsyncPaginatedIterator<ScheduledJobAttributes & { id: number }> {
    return new AsyncPaginatedIterator<ScheduledJobAttributes & { id: number }>(async (cursor) => {
      const query = cursor !== null ? `?page[cursor]=${cursor}` : "";
      const response = await this.client.get<JsonApiListDocument<ScheduledJobAttributes>>(
        `${this.basePath}${query}`,
      );
      return {
        items: unwrapListDocument(response),
        nextCursor: response.meta.next_cursor ?? null,
      };
    });
  }

  /**
   * Get a specific scheduled job.
   *
   * @example
   * ```ts
   * const job = await forge.server(123).scheduledJobs.get(789);
   * ```
   */
  async get(jobId: number): Promise<ScheduledJobAttributes & { id: number }> {
    const response = await this.client.get<JsonApiDocument<ScheduledJobAttributes>>(
      `${this.basePath}/${jobId}`,
    );
    return unwrapDocument(response);
  }

  /**
   * Create a new scheduled job.
   *
   * @example
   * ```ts
   * const job = await forge.server(123).scheduledJobs.create({
   *   command: 'php /home/forge/artisan schedule:run',
   *   user: 'forge',
   *   frequency: 'minutely',
   * });
   * ```
   */
  async create(data: CreateScheduledJobData): Promise<ScheduledJobAttributes & { id: number }> {
    const response = await this.client.post<JsonApiDocument<ScheduledJobAttributes>>(
      this.basePath,
      data,
    );
    return unwrapDocument(response);
  }

  /**
   * Delete a scheduled job.
   *
   * @example
   * ```ts
   * await forge.server(123).scheduledJobs.delete(789);
   * ```
   */
  async delete(jobId: number): Promise<void> {
    await this.client.delete(`${this.basePath}/${jobId}`);
  }
}
