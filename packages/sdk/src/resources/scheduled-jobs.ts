import type {
  CreateScheduledJobData,
  ForgeScheduledJob,
  HttpClient,
  ScheduledJobResponse,
  ScheduledJobsResponse,
} from "@studiometa/forge-api";

import { BaseCollection } from "./base.ts";
import { AsyncPaginatedIterator } from "../pagination.ts";

/**
 * Options for listing scheduled jobs.
 */
export interface ScheduledJobListOptions {
  /** Page number to fetch (1-indexed). */
  page?: number;
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
    private readonly serverId: number,
  ) {
    super(client);
  }

  private get basePath(): string {
    return `/servers/${this.serverId}/jobs`;
  }

  /**
   * List scheduled jobs on this server.
   *
   * @example
   * ```ts
   * const jobs = await forge.server(123).scheduledJobs.list();
   *
   * // Fetch a specific page:
   * const page2 = await forge.server(123).scheduledJobs.list({ page: 2 });
   * ```
   */
  async list(options: ScheduledJobListOptions = {}): Promise<ForgeScheduledJob[]> {
    const query = options.page !== undefined ? `?page=${options.page}` : "";
    const response = await this.client.get<ScheduledJobsResponse>(`${this.basePath}${query}`);
    return response.jobs;
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
    options: Omit<ScheduledJobListOptions, "page"> = {},
  ): AsyncPaginatedIterator<ForgeScheduledJob> {
    return new AsyncPaginatedIterator<ForgeScheduledJob>((page) => this.list({ ...options, page }));
  }

  /**
   * Get a specific scheduled job.
   *
   * @example
   * ```ts
   * const job = await forge.server(123).scheduledJobs.get(789);
   * ```
   */
  async get(jobId: number): Promise<ForgeScheduledJob> {
    const response = await this.client.get<ScheduledJobResponse>(`${this.basePath}/${jobId}`);
    return response.job;
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
  async create(data: CreateScheduledJobData): Promise<ForgeScheduledJob> {
    const response = await this.client.post<ScheduledJobResponse>(this.basePath, data);
    return response.job;
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
