import type { CommandOptions } from "../../context.ts";

import { createContext } from "../../context.ts";
import { sshConnect } from "./handlers.ts";

/**
 * Route the top-level `forge ssh` command.
 *
 * Unlike resource commands there is no sub-action: the first positional is the
 * server, and any remaining positionals form an optional remote command.
 */
export async function handleSshCommand(
  server: string | undefined,
  remote: string[],
  options: CommandOptions,
): Promise<void> {
  const ctx = createContext(options);
  await sshConnect(server, remote, ctx);
}
