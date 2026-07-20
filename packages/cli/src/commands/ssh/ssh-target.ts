/**
 * Pure helpers for resolving SSH connection details from a Forge server.
 *
 * Kept free of side effects so the resolution logic is fully unit-testable
 * without spawning a real `ssh` process.
 */

import type { ServerAttributes } from "@studiometa/forge-api";

import { ValidationError } from "../../errors.ts";

/** Forge's conventional default provisioning user. */
export const DEFAULT_SSH_USER = "forge";

export interface SshTargetOptions {
  /** SSH user (defaults to {@link DEFAULT_SSH_USER}). */
  user?: string;
  /** Connect over the private network (`private_ip_address`) instead of the public IP. */
  private?: boolean;
  /** Override the server's `ssh_port` (string as parsed from the CLI). */
  port?: string;
}

export interface SshTarget {
  user: string;
  host: string;
  port: number;
}

/**
 * Resolve the concrete user/host/port to connect to.
 *
 * @throws {ValidationError} when the selected IP is not available yet, or the port override is invalid.
 */
export function resolveSshTarget(
  server: ServerAttributes,
  options: SshTargetOptions = {},
): SshTarget {
  const user = options.user?.trim() || DEFAULT_SSH_USER;

  const host = options.private ? server.private_ip_address : server.ip_address;
  if (!host) {
    const which = options.private ? "private IP address" : "IP address";
    const hints = [
      server.is_ready
        ? "The server is ready but no address is available — check the Forge dashboard."
        : "The server is still provisioning. Wait until it is ready, then try again.",
      options.private ? undefined : "Use --private to connect over the private network.",
    ].filter((hint): hint is string => Boolean(hint));

    throw new ValidationError(`Server "${server.name}" has no ${which} available`, "server", hints);
  }

  let port = server.ssh_port;
  if (options.port !== undefined) {
    const parsed = Number(options.port);
    if (!Number.isInteger(parsed) || parsed < 1 || parsed > 65535) {
      throw new ValidationError(`Invalid SSH port "${options.port}"`, "port", [
        "Port must be an integer between 1 and 65535.",
      ]);
    }
    port = parsed;
  }

  return { user, host, port };
}

/**
 * Build the argument list passed to the `ssh` binary.
 *
 * Any {@link remoteCommand} is appended after the connection flags, so
 * `forge ssh web uptime` runs `uptime` remotely and exits.
 */
export function buildSshArgs(target: SshTarget, remoteCommand: string[] = []): string[] {
  const args = [`${target.user}@${target.host}`, "-p", String(target.port)];
  if (remoteCommand.length > 0) {
    args.push(...remoteCommand);
  }
  return args;
}
