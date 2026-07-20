import type { ExecutorContext, ExecutorResult } from "../../context.ts";
import { getServer } from "../servers/get.ts";

import type { ListServicesOptions, ServiceStatus } from "./types.ts";

/**
 * List services on a server with a derived availability flag.
 *
 * The v2 API has no GET endpoint for services, so availability is inferred from
 * the server object attributes. This `available` flag is a documented heuristic:
 *
 * - nginx      → always available
 * - php        → available when `php_version` is set (detail = php_version)
 * - mysql      → available when `database_type` starts with "mysql"/"mariadb"
 * - postgres   → available when `database_type` starts with "postgres"
 * - redis      → available when `redis_status` is non-null
 * - supervisor → always available
 */
export async function listServices(
  options: ListServicesOptions,
  ctx: ExecutorContext,
): Promise<ExecutorResult<ServiceStatus[]>> {
  const { data: server } = await getServer({ server_id: options.server_id }, ctx);

  const databaseType = server.database_type ?? "";
  const isMysql = databaseType.startsWith("mysql") || databaseType.startsWith("mariadb");
  const isPostgres = databaseType.startsWith("postgres");

  const rows: ServiceStatus[] = [
    { service: "nginx", available: true, detail: null },
    {
      service: "php",
      available: server.php_version !== null,
      detail: server.php_version,
    },
    {
      service: "mysql",
      available: isMysql,
      detail: isMysql ? server.database_type : null,
    },
    {
      service: "postgres",
      available: isPostgres,
      detail: isPostgres ? server.database_type : null,
    },
    {
      service: "redis",
      available: server.redis_status !== null,
      detail: server.redis_status,
    },
    { service: "supervisor", available: true, detail: null },
  ];

  return {
    data: rows,
  };
}
