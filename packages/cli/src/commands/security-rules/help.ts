import { colors } from "../../utils/colors.ts";

export function showSecurityRulesHelp(subcommand?: string): void {
  if (subcommand === "list" || subcommand === "ls") {
    console.log(`
${colors.bold("forge-cli security-rules list")} - List security rules for a site

${colors.bold("USAGE:")}
  forge-cli security-rules list --server <server_id> --site <site_id> [options]

${colors.bold("OPTIONS:")}
  --server <id>       Server ID (required)
  --site <id>         Site ID (required)
  -f, --format <fmt>  Output format: json, human, table
`);
  } else if (subcommand === "get") {
    console.log(`
${colors.bold("forge-cli security-rules get")} - Get security rule details

${colors.bold("USAGE:")}
  forge-cli security-rules get <rule_id> --server <server_id> --site <site_id> [options]
`);
  } else if (subcommand === "create") {
    console.log(`
${colors.bold("forge-cli security-rules create")} - Create a new security rule

${colors.bold("USAGE:")}
  forge-cli security-rules create --server <server_id> --site <site_id> --name <name> [options]

${colors.bold("OPTIONS:")}
  --server <id>         Server ID (required)
  --site <id>           Site ID (required)
  --name <name>         Security rule name (required)
  -f, --format <fmt>    Output format: json, human, table
`);
  } else if (subcommand === "delete") {
    console.log(`
${colors.bold("forge-cli security-rules delete")} - Delete a security rule

${colors.bold("USAGE:")}
  forge-cli security-rules delete <rule_id> --server <server_id> --site <site_id> [options]
`);
  } else {
    console.log(`
${colors.bold("forge-cli security-rules")} - Manage site security rules

${colors.bold("USAGE:")}
  forge-cli security-rules <subcommand> [options]

${colors.bold("SUBCOMMANDS:")}
  list, ls            List security rules
  get <id>            Get security rule details
  create              Create a new security rule
  delete <id>         Delete a security rule

${colors.bold("OPTIONS:")}
  --server <id>       Server ID (required)
  --site <id>         Site ID (required)
  -f, --format <fmt>  Output format: json, human, table

Run ${colors.cyan("forge-cli security-rules <subcommand> --help")} for details.
`);
  }
}
