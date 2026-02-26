import { listFirewallRules, getFirewallRule } from "@studiometa/forge-core";

import type { CommandContext } from "../../context.ts";

import { exitWithValidationError, runCommand } from "../../error-handler.ts";
import { resolveServerId } from "../../utils/resolve.ts";

export async function firewallRulesList(ctx: CommandContext): Promise<void> {
  const server = String(ctx.options.server ?? "");

  if (!server) {
    exitWithValidationError(
      "server_id",
      "forge-cli firewall-rules list --server <server_id>",
      ctx.formatter,
    );
  }

  await runCommand(async () => {
    const token = ctx.getToken();
    const execCtx = ctx.createExecutorContext(token);
    const server_id = await resolveServerId(server, execCtx);
    const result = await listFirewallRules({ server_id }, execCtx);
    ctx.formatter.outputList(
      result.data,
      ["id", "name", "port", "type", "ip_address", "status"],
      "No firewall rules found.",
      (r) =>
        `${String(r.id).padEnd(8)} ${r.name.padEnd(20)} ${String(r.port).padEnd(8)} ${r.type.padEnd(8)} ${(r.ip_address ?? "any").padEnd(16)} ${r.status}`,
    );
  }, ctx.formatter);
}

export async function firewallRulesGet(args: string[], ctx: CommandContext): Promise<void> {
  const [id] = args;
  const server = String(ctx.options.server ?? "");

  if (!id) {
    exitWithValidationError(
      "firewall_rule_id",
      "forge-cli firewall-rules get <rule_id> --server <server_id>",
      ctx.formatter,
    );
  }

  if (!server) {
    exitWithValidationError(
      "server_id",
      "forge-cli firewall-rules get <rule_id> --server <server_id>",
      ctx.formatter,
    );
  }

  await runCommand(async () => {
    const token = ctx.getToken();
    const execCtx = ctx.createExecutorContext(token);
    const server_id = await resolveServerId(server, execCtx);
    const result = await getFirewallRule({ server_id, id }, execCtx);
    ctx.formatter.outputOne(result.data, [
      "id", "name", "port", "type", "ip_address", "status", "created_at",
    ]);
  }, ctx.formatter);
}
