/**
 * Option types for monitor executors.
 */

import type { CreateMonitorData } from "@studiometa/forge-api";

/**
 * Options for listing monitors on a server.
 */
export interface ListMonitorsOptions {
  server_id: string;
}

/**
 * Options for getting a single monitor.
 */
export interface GetMonitorOptions {
  server_id: string;
  id: string;
}

/**
 * Options for creating a monitor.
 */
export interface CreateMonitorOptions extends CreateMonitorData {
  server_id: string;
}

/**
 * Options for deleting a monitor.
 */
export interface DeleteMonitorOptions {
  server_id: string;
  id: string;
}
