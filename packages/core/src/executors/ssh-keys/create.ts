import type { ExecutorContext, ExecutorResult } from "../../context.ts";
import { ROUTES, request } from "../../routes.ts";

import type { CreateSshKeyOptions } from "./types.ts";

/**
 * Create an SSH key.
 */
export async function createSshKey(
  options: CreateSshKeyOptions,
  ctx: ExecutorContext,
): Promise<ExecutorResult<void>> {
  const { server_id, ...data } = options;
  await request(ROUTES.sshKeys.create, ctx, { server_id }, { body: data });

  return { data: undefined };
}
