import { colors } from "../../utils/colors.ts";

export function showFirewallRulesHelp(subcommand?: string): void {
  if (subcommand === "list" || subcommand === "ls") {
    console.log(`
${colors.bold("forge-cli firewall-rules list")} - List firewall rules on a server

${colors.bold("USAGE:")}
  forge-cli firewall-rules list --server <server_id> [options]
`);
  } else if (subcommand === "get") {
    console.log(`
${colors.bold("forge-cli firewall-rules get")} - Get firewall rule details

${colors.bold("USAGE:")}
  forge-cli firewall-rules get <rule_id> --server <server_id>
`);
  } else {
    console.log(`
${colors.bold("forge-cli firewall-rules")} - Manage firewall rules

${colors.bold("USAGE:")}
  forge-cli firewall-rules <subcommand> [options]

${colors.bold("ALIASES:")}
  forge-cli fw

${colors.bold("SUBCOMMANDS:")}
  list, ls            List firewall rules
  get <id>            Get firewall rule details

${colors.bold("OPTIONS:")}
  --server <id>       Server ID (required)
  -f, --format <fmt>  Output format: json, human, table

Run ${colors.cyan("forge-cli firewall-rules <subcommand> --help")} for details.
`);
  }
}
