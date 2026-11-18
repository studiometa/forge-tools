import type {
  CreateScheduledJobData,
  HttpClient,
  JsonApiDocument,
  ScheduledJobAttributes,
  OutputAttributes,
} from "@studiometa/forge-api";

import { unwrapDocument } from "@studiometa/forge-api";

import type { AllOptions, ListOptions } from "../list-options.ts";

import { BaseCollection } from "./base.ts";
import type { AsyncPaginatedIterator } from "../pagination.ts";

/**
 * Options for listing scheduled jobs.
 */
export type ScheduledJobListOptions = ListOptions<
  "status" | "user",
  "created_at" | "updated_at" | "status"
>;

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
    private readonly siteId?: number,
  ) {
    super(client, orgSlug);
  }

  private get basePath(): string {
    const server = `/orgs/${this.orgSlug}/servers/${this.serverId}`;
    return this.siteId === undefined
      ? `${server}/scheduled-jobs`
      : `${server}/sites/${this.siteId}/scheduled-jobs`;
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
    return this.listPage<ScheduledJobAttributes>(this.basePath, options);
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
  all(
    options: AllOptions<ScheduledJobListOptions> = {},
  ): AsyncPaginatedIterator<ScheduledJobAttributes & { id: number }> {
    return this.iterate<ScheduledJobAttributes>(this.basePath, options);
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

  /**
   * Get the output of the last run of a scheduled job.
   *
   * @example
   * ```ts
   * const output = await forge.server(123).scheduledJobs.output(456);
   * ```
   */
  async output(jobId: number): Promise<string> {
    return (await this.getResource<OutputAttributes>(`${this.basePath}/${jobId}/output`)).output;
  }
}
