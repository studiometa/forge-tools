import type { HttpClient, JsonApiDocument, ServerAttributes } from "@studiometa/forge-api";

import { unwrapDocument } from "@studiometa/forge-api";

import { BaseCollection } from "./base.ts";

/**
 * The six restartable services exposed by the Forge v2 API.
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
 * A single service availability row.
 *
 * `available` is a documented heuristic derived from the server object, since
 * the API has no services GET endpoint.
 */
export interface ServiceStatus {
  service: string;
  available: boolean;
  detail: string | null;
}

/**
 * Options for restarting a service.
 */
export interface RestartServiceOptions {
  /** PHP version (e.g. "php83") — required when restarting the php service. */
  version?: string;
}

/**
 * Services on a server — list availability and restart individual services.
 *
 * Access via `forge.server(id).services`.
 *
 * The v2 API has no GET endpoint for services, so `list()` derives availability
 * from the server object. Restarting maps to the API action `reboot`.
 *
 * @example
 * ```ts
 * // List services and their availability
 * const services = await forge.server(123).services.list();
 *
 * // Restart nginx
 * await forge.server(123).services.restart('nginx');
 *
 * // Restart php (version required)
 * await forge.server(123).services.restart('php', { version: 'php83' });
 * ```
 */
export class ServicesCollection extends BaseCollection {
  /** @internal */
  constructor(
    client: HttpClient,
    orgSlug: string,
    private readonly serverId: number,
  ) {
    super(client, orgSlug);
  }

  private get basePath(): string {
    return `/orgs/${this.orgSlug}/servers/${this.serverId}`;
  }

  /**
   * List services on this server with a derived availability flag.
   *
   * @example
   * ```ts
   * const services = await forge.server(123).services.list();
   * // → [{ service: 'nginx', available: true, detail: null }, ...]
   * ```
   */
  async list(): Promise<ServiceStatus[]> {
    const response = await this.client.get<JsonApiDocument<ServerAttributes>>(this.basePath);
    const server = unwrapDocument(response);

    const databaseType = server.database_type ?? "";
    const isMysql = databaseType.startsWith("mysql") || databaseType.startsWith("mariadb");
    const isPostgres = databaseType.startsWith("postgres");

    return [
      { service: "nginx", available: true, detail: null },
      { service: "php", available: server.php_version !== null, detail: server.php_version },
      { service: "mysql", available: isMysql, detail: isMysql ? server.database_type : null },
      {
        service: "postgres",
        available: isPostgres,
        detail: isPostgres ? server.database_type : null,
      },
      { service: "redis", available: server.redis_status !== null, detail: server.redis_status },
      { service: "supervisor", available: true, detail: null },
    ];
  }

  /**
   * Restart a service on this server.
   *
   * Maps to the API action `reboot`. The php service requires a `version`.
   *
   * @example
   * ```ts
   * await forge.server(123).services.restart('nginx');
   * await forge.server(123).services.restart('php', { version: 'php83' });
   * ```
   */
  async restart(service: string, options: RestartServiceOptions = {}): Promise<void> {
    if (!(RESTARTABLE_SERVICES as readonly string[]).includes(service)) {
      throw new Error(
        `Invalid service "${service}". Valid services: ${RESTARTABLE_SERVICES.join(", ")}.`,
      );
    }

    await this.client.post(`${this.basePath}/services/${service}/actions`, {
      action: "reboot",
      ...(options.version ? { version: options.version } : {}),
    });
  }
}
