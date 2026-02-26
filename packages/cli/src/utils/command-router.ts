/**
 * Generic command router factory for CLI commands.
 *
 * Eliminates boilerplate switch/case pattern in command routing.
 *
 * @example
 * ```typescript
 * import { createCommandRouter } from '../../utils/command-router.ts';
 * import { serversList, serversGet } from './handlers.ts';
 *
 * export const handleServersCommand = createCommandRouter({
 *   resource: 'servers',
 *   handlers: {
 *     list: serversList,
 *     ls: serversList,
 *     get: [serversGet, 'args'],
 *   },
 * });
 * ```
 */

import type { CommandContext, CommandOptions } from "../context.ts";
import type { OutputFormat } from "../types.ts";

import { createContext } from "../context.ts";
import { OutputFormatter } from "../output.ts";
import { getCliAuditLogger } from "../audit.ts";

/**
 * Handler that only receives context (e.g., list commands)
 */
export type ListHandler = (ctx: CommandContext) => Promise<void>;

/**
 * Handler that receives args and context (e.g., get/update commands)
 */
export type ArgsHandler = (args: string[], ctx: CommandContext) => Promise<void>;

/**
 * Handler definition - either a ListHandler or an ArgsHandler marked with 'args'
 */
export type Handler = ListHandler | [ArgsHandler, "args"];

/**
 * Configuration for the command router
 */
export interface CommandRouterConfig {
  /** Resource name for error messages (e.g., 'servers', 'sites') */
  resource: string;
  /** Map of subcommand names to handlers */
  handlers: Record<string, Handler>;
  /**
   * Set of subcommand names that are write operations.
   * These will be recorded in the audit log on success or failure.
   */
  writeSubcommands?: ReadonlyArray<string>;
}

/**
 * Creates a command router function that dispatches to the appropriate handler.
 */
export function createCommandRouter(config: CommandRouterConfig) {
  return async function (
    subcommand: string,
    args: string[],
    options: Record<string, string | boolean | string[]>,
  ): Promise<void> {
    const format = (options.format ?? options.f ?? "human") as OutputFormat;
    const formatter = new OutputFormatter(format, options["no-color"] === true);

    const ctx = createContext(options as CommandOptions);

    const handler = config.handlers[subcommand];
    if (!handler) {
      formatter.error(`Unknown ${config.resource} subcommand: ${subcommand}`);
      process.exit(1);
      return; // Unreachable in production, but needed for tests where process.exit is mocked
    }

    const isWrite = config.writeSubcommands?.includes(subcommand) ?? false;

    if (isWrite) {
      // Sanitized args for audit log (strip token)
      const { token: _token, ...safeOptions } = options as Record<string, unknown>;
      try {
        if (Array.isArray(handler)) {
          await handler[0](args, ctx);
        } else {
          await handler(ctx);
        }
        getCliAuditLogger().log({
          source: "cli",
          resource: config.resource,
          action: subcommand,
          args: safeOptions,
          status: "success",
        });
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        getCliAuditLogger().log({
          source: "cli",
          resource: config.resource,
          action: subcommand,
          args: safeOptions,
          status: "error",
          error: errorMessage,
        });
        throw err;
      }
    } else {
      if (Array.isArray(handler)) {
        // ArgsHandler - receives args and context
        await handler[0](args, ctx);
      } else {
        // ListHandler - receives only context
        await handler(ctx);
      }
    }
  };
}
