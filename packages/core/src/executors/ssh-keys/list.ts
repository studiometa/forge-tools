import type { SshKeyAttributes } from "@studiometa/forge-api";
import { SshKeyAttributesSchema } from "@studiometa/forge-api";
import type { ExecutorContext, ExecutorResult } from "../../context.ts";
import { ROUTES } from "../../routes.ts";
import { listAllPages } from "../../utils/list-all-pages.ts";

import type { ListSshKeysOptions } from "./types.ts";

/**
 * List SSH keys on a server, from every page. Filter by server user with `user`.
 */
export async function listSshKeys(
  options: ListSshKeysOptions,
  ctx: ExecutorContext,
): Promise<ExecutorResult<Array<SshKeyAttributes & { id: number }>>> {
  return {
    data: await listAllPages(
      ROUTES.sshKeys.list,
      ctx,
      { server_id: options.server_id },
      SshKeyAttributesSchema,
      options.user ? { "filter[user]": options.user } : {},
    ),
  };
}
