/**
 * Option types for scheduled job executors.
 */

import type { CreateScheduledJobData } from "@studiometa/forge-api";

/**
 * Options for listing scheduled jobs on a server.
 */
export interface ListScheduledJobsOptions {
  server_id: string;
}

/**
 * Options for getting a single scheduled job.
 */
export interface GetScheduledJobOptions {
  server_id: string;
  id: string;
}

/**
 * Options for creating a scheduled job.
 */
export interface CreateScheduledJobOptions extends CreateScheduledJobData {
  server_id: string;
}

/**
 * Options for deleting a scheduled job.
 */
export interface DeleteScheduledJobOptions {
  server_id: string;
  id: string;
}
