/**
 * Option types for event executors.
 *
 * Events are the actions that Forge ran on the servers of the organization
 * (provisioning steps, deployments, configuration changes).
 */

/**
 * Options for listing the latest events: those of a server, or of the whole organization
 * without `server_id`.
 */
export interface ListEventsOptions {
  server_id?: string;
  /** Only the events that this user ID started. */
  initiated_by?: string;
  /** Only the events that ran as this server user, e.g. `forge` or `root`. */
  ran_as?: string;
}

/**
 * Options for getting an event of a server, or its output.
 */
export interface GetEventOptions {
  server_id: string;
  id: string;
}
