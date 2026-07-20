/**
 * Option and result types for service executors.
 */

/**
 * The six restartable services exposed by the Forge v2 API.
 *
 * There is no GET endpoint for services — availability is inferred from the
 * server object (see `listServices`).
 */
export const RESTARTABLE_SERVICES = [
  "nginx",
  "php",
  "mysql",
  "postgres",
  "redis",
  "supervisor",
] as const;

export type RestartableService = (typeof RESTARTABLE_SERVICES)[number];

/**
 * Options for restarting a service on a server.
 */
export interface RestartServiceOptions {
  server_id: string;
  /** One of the six restartable services. */
  service: string;
  /** PHP version (e.g. "php83") — required when restarting the php service. */
  version?: string;
}

/**
 * Options for listing services on a server.
 */
export interface ListServicesOptions {
  server_id: string;
}

/**
 * A single service availability row.
 *
 * `available` is a documented heuristic derived from the server attributes,
 * since the API has no services GET endpoint.
 */
export interface ServiceStatus {
  service: string;
  available: boolean;
  detail: string | null;
}
