/**
 * CLI handler for `forge ssh` — open an interactive SSH session to a server.
 *
 * Resolves the server, reads its connection details from the API, then hands
 * off to the local `ssh` binary with an inherited stdio (interactive) session.
 */

import { spawnSync } from "node:child_process";

import { getServer } from "@studiometa/forge-core";

import type { CommandContext } from "../../context.ts";

import { exitWithValidationError, runCommand } from "../../error-handler.ts";
import { getCliAuditLogger } from "../../audit.ts";
import { resolveServerId } from "../../utils/resolve.ts";
import { buildSshArgs, resolveSshTarget } from "./ssh-target.ts";

/**
 * Connect to a server over SSH.
 *
 * @param server - Server ID or name (resolved via {@link resolveServerId}).
 * @param remote - Optional remote command to run instead of an interactive shell.
 * @param ctx - CLI command context.
 */
export async function sshConnect(
  server: string | undefined,
  remote: string[],
  ctx: CommandContext,
): Promise<void> {
  if (!server) {
    exitWithValidationError("server", "forge ssh <server> [command...]", ctx.formatter);
  }

  await runCommand(async () => {
    const token = ctx.getToken();
    const execCtx = ctx.createExecutorContext(token);
    const server_id = await resolveServerId(server, execCtx);
    const { data } = await getServer({ server_id }, execCtx);

    const target = resolveSshTarget(data, {
      user: typeof ctx.options.user === "string" ? ctx.options.user : undefined,
      private: ctx.options.private === true,
      port: typeof ctx.options.port === "string" ? ctx.options.port : undefined,
    });

    const sshArgs = buildSshArgs(target, remote);
    const printable = `ssh ${sshArgs.join(" ")}`;

    // Script-safe modes: print the resolved command instead of opening a session.
    if (ctx.formatter.isJson()) {
      ctx.formatter.output({ command: printable, ...target, args: sshArgs });
      return;
    }
    if (ctx.options["dry-run"] === true) {
      console.log(printable);
      return;
    }

    // Sanitized args for the audit log (never record the token).
    const auditArgs = {
      server: server_id,
      user: target.user,
      host: target.host,
      port: target.port,
    };

    try {
      const child = spawnSync("ssh", sshArgs, { stdio: "inherit" });
      if (child.error) {
        throw child.error;
      }
      getCliAuditLogger().log({
        source: "cli",
        resource: "ssh",
        action: "connect",
        args: auditArgs,
        status: "success",
      });
      if (typeof child.status === "number" && child.status !== 0) {
        process.exit(child.status);
      }
    } catch (err) {
      getCliAuditLogger().log({
        source: "cli",
        resource: "ssh",
        action: "connect",
        args: auditArgs,
        status: "error",
        error: err instanceof Error ? err.message : String(err),
      });
      throw err;
    }
  }, ctx.formatter);
}
