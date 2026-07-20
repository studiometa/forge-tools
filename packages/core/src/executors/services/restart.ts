import type { ExecutorContext, ExecutorResult } from "../../context.ts";
import { ROUTES, request } from "../../routes.ts";

import { RESTARTABLE_SERVICES, type RestartServiceOptions } from "./types.ts";

/**
 * Restart a service on a server.
 *
 * Maps the user verb "restart" to the API action "reboot". The v2 API restarts
 * a service via POST /servers/{server}/services/{service}/actions with body
 * `{ action: "reboot" }`. The php service additionally requires a `version`.
 */
export async function restartService(
  options: RestartServiceOptions,
  ctx: ExecutorContext,
): Promise<ExecutorResult<void>> {
  if (!(RESTARTABLE_SERVICES as readonly string[]).includes(options.service)) {
    throw new Error(
      `Invalid service "${options.service}". Valid services: ${RESTARTABLE_SERVICES.join(", ")}.`,
    );
  }

  await request(
    ROUTES.services.action,
    ctx,
    { server_id: options.server_id, service: options.service },
    {
      body: {
        action: "reboot",
        ...(options.version ? { version: options.version } : {}),
      },
    },
  );

  return {
    data: undefined,
  };
}
