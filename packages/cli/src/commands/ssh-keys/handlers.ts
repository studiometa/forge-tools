import { listSshKeys, getSshKey } from "@studiometa/forge-core";

import type { CommandContext } from "../../context.ts";

import { exitWithValidationError, runCommand } from "../../error-handler.ts";
import { resolveServerId } from "../../utils/resolve.ts";

export async function sshKeysList(ctx: CommandContext): Promise<void> {
  const server = String(ctx.options.server ?? "");

  if (!server) {
    exitWithValidationError(
      "server_id",
      "forge-cli ssh-keys list --server <server_id>",
      ctx.formatter,
    );
  }

  await runCommand(async () => {
    const token = ctx.getToken();
    const execCtx = ctx.createExecutorContext(token);
    const server_id = await resolveServerId(server, execCtx);
    const result = await listSshKeys({ server_id }, execCtx);
    ctx.formatter.outputList(
      result.data,
      ["id", "name", "status"],
      "No SSH keys found.",
      (k) => `${String(k.id).padEnd(8)} ${k.name.padEnd(30)} ${k.status}`,
    );
  }, ctx.formatter);
}

export async function sshKeysGet(args: string[], ctx: CommandContext): Promise<void> {
  const [id] = args;
  const server = String(ctx.options.server ?? "");

  if (!id) {
    exitWithValidationError(
      "ssh_key_id",
      "forge-cli ssh-keys get <key_id> --server <server_id>",
      ctx.formatter,
    );
  }

  if (!server) {
    exitWithValidationError(
      "server_id",
      "forge-cli ssh-keys get <key_id> --server <server_id>",
      ctx.formatter,
    );
  }

  await runCommand(async () => {
    const token = ctx.getToken();
    const execCtx = ctx.createExecutorContext(token);
    const server_id = await resolveServerId(server, execCtx);
    const result = await getSshKey({ server_id, id }, execCtx);
    ctx.formatter.outputOne(result.data, ["id", "name", "status", "created_at"]);
  }, ctx.formatter);
}
