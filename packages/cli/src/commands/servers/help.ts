import { colors } from "../../utils/colors.ts";

export function showServersHelp(subcommand?: string): void {
  if (subcommand === "list" || subcommand === "ls") {
    console.log(`
${colors.bold("forge-cli servers list")} - List all servers

${colors.bold("USAGE:")}
  forge-cli servers list [options]

${colors.bold("OPTIONS:")}
  --token <token>     Forge API token
  -f, --format <fmt>  Output format: json, human, table (default: human)
  --no-color          Disable colored output
  -h, --help          Show this help

${colors.bold("EXAMPLES:")}
  forge-cli servers list
  forge-cli servers list --format json
`);
  } else if (subcommand === "get") {
    console.log(`
${colors.bold("forge-cli servers get")} - Get server details

${colors.bold("USAGE:")}
  forge-cli servers get <server_id> [options]

${colors.bold("ARGUMENTS:")}
  <server_id>         Server ID (required)

${colors.bold("OPTIONS:")}
  -f, --format <fmt>  Output format: json, human, table

${colors.bold("EXAMPLES:")}
  forge-cli servers get 123
  forge-cli servers get 123 --format json
`);
  } else if (subcommand === "reboot") {
    console.log(`
${colors.bold("forge-cli servers reboot")} - Reboot a server

${colors.bold("USAGE:")}
  forge-cli servers reboot <server_id> [options]

${colors.bold("ARGUMENTS:")}
  <server_id>         Server ID (required)

${colors.bold("EXAMPLES:")}
  forge-cli servers reboot 123
`);
  } else {
    console.log(`
${colors.bold("forge-cli servers")} - Manage servers

${colors.bold("USAGE:")}
  forge-cli servers <subcommand> [options]

${colors.bold("ALIASES:")}
  forge-cli s

${colors.bold("SUBCOMMANDS:")}
  list, ls            List all servers
  get <id>            Get server details
  reboot <id>         Reboot a server

${colors.bold("OPTIONS:")}
  -f, --format <fmt>  Output format: json, human, table
  -h, --help          Show help for a subcommand

${colors.bold("EXAMPLES:")}
  forge-cli servers list
  forge-cli servers get 123

Run ${colors.cyan("forge-cli servers <subcommand> --help")} for subcommand details.
`);
  }
}
