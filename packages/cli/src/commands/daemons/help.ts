import { colors } from "../../utils/colors.ts";

export function showDaemonsHelp(subcommand?: string): void {
  if (subcommand === "list" || subcommand === "ls") {
    console.log(`
${colors.bold("forge-cli daemons list")} - List daemons on a server

${colors.bold("USAGE:")}
  forge-cli daemons list --server <server_id> [options]
`);
  } else if (subcommand === "get") {
    console.log(`
${colors.bold("forge-cli daemons get")} - Get daemon details

${colors.bold("USAGE:")}
  forge-cli daemons get <daemon_id> --server <server_id>
`);
  } else if (subcommand === "restart") {
    console.log(`
${colors.bold("forge-cli daemons restart")} - Restart a daemon

${colors.bold("USAGE:")}
  forge-cli daemons restart <daemon_id> --server <server_id>
`);
  } else {
    console.log(`
${colors.bold("forge-cli daemons")} - Manage daemons

${colors.bold("USAGE:")}
  forge-cli daemons <subcommand> [options]

${colors.bold("SUBCOMMANDS:")}
  list, ls            List daemons
  get <id>            Get daemon details
  restart <id>        Restart a daemon

${colors.bold("OPTIONS:")}
  --server <id>       Server ID (required)
  -f, --format <fmt>  Output format: json, human, table

Run ${colors.cyan("forge-cli daemons <subcommand> --help")} for details.
`);
  }
}
