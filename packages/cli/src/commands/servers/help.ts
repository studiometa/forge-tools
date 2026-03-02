import { colors } from "../../utils/colors.ts";

export function showServersHelp(subcommand?: string): void {
  if (subcommand === "list" || subcommand === "ls") {
    console.log(`
${colors.bold("forge servers list")} - List all servers

${colors.bold("USAGE:")}
  forge servers list [options]

${colors.bold("OPTIONS:")}
  --token <token>     Forge API token
  -f, --format <fmt>  Output format: json, human, table (default: human)
  --no-color          Disable colored output
  -h, --help          Show this help

${colors.bold("EXAMPLES:")}
  forge servers list
  forge servers list --format json
`);
  } else if (subcommand === "get") {
    console.log(`
${colors.bold("forge servers get")} - Get server details

${colors.bold("USAGE:")}
  forge servers get <server_id> [options]

${colors.bold("ARGUMENTS:")}
  <server_id>         Server ID (required)

${colors.bold("OPTIONS:")}
  -f, --format <fmt>  Output format: json, human, table

${colors.bold("EXAMPLES:")}
  forge servers get 123
  forge servers get 123 --format json
`);
  } else if (subcommand === "reboot") {
    console.log(`
${colors.bold("forge servers reboot")} - Reboot a server

${colors.bold("USAGE:")}
  forge servers reboot <server_id> [options]

${colors.bold("ARGUMENTS:")}
  <server_id>         Server ID (required)

${colors.bold("EXAMPLES:")}
  forge servers reboot 123
`);
  } else {
    console.log(`
${colors.bold("forge servers")} - Manage servers

${colors.bold("USAGE:")}
  forge servers <subcommand> [options]

${colors.bold("ALIASES:")}
  forge s

${colors.bold("SUBCOMMANDS:")}
  list, ls            List all servers
  get <id>            Get server details
  reboot <id>         Reboot a server

${colors.bold("OPTIONS:")}
  -f, --format <fmt>  Output format: json, human, table
  -h, --help          Show help for a subcommand

${colors.bold("EXAMPLES:")}
  forge servers list
  forge servers get 123

Run ${colors.cyan("forge servers <subcommand> --help")} for subcommand details.
`);
  }
}
