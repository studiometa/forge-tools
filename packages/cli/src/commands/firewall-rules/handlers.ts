import { listFirewallRules, getFirewallRule } from "@studiometa/forge-core";

import type { CommandContext } from "../../context.ts";

import { exitWithValidationError, runCommand } from "../../error-handler.ts";

export async function firewallRulesList(ctx: CommandContext): Promise<void> {
  const server_id = String(ctx.options.server ?? "");

  if (!server_id) {
    exitWithValidationError(
      "server_id",
      "forge-cli firewall-rules list --server <server_id>",
      ctx.formatter,
    );
  }

  await runCommand(async () => {
    const token = ctx.getToken();
    const execCtx = ctx.createExecutorContext(token);
    const result = await listFirewallRules({ server_id }, execCtx);
    ctx.formatter.output(result.data);
  }, ctx.formatter);
}

export async function firewallRulesGet(args: string[], ctx: CommandContext): Promise<void> {
  const [id] = args;
  const server_id = String(ctx.options.server ?? "");

  if (!id) {
    exitWithValidationError(
      "firewall_rule_id",
      "forge-cli firewall-rules get <rule_id> --server <server_id>",
      ctx.formatter,
    );
  }

  if (!server_id) {
    exitWithValidationError(
      "server_id",
      "forge-cli firewall-rules get <rule_id> --server <server_id>",
      ctx.formatter,
    );
  }

  await runCommand(async () => {
    const token = ctx.getToken();
    const execCtx = ctx.createExecutorContext(token);
    const result = await getFirewallRule({ server_id, id }, execCtx);
    ctx.formatter.output(result.data);
  }, ctx.formatter);
}
