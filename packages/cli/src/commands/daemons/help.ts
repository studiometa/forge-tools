import { colors } from "../../utils/colors.ts";

export function showDaemonsHelp(subcommand?: string): void {
  if (subcommand === "list" || subcommand === "ls") {
    console.log(`
${colors.bold("forge daemons list")} - List daemons on a server

${colors.bold("USAGE:")}
  forge daemons list --server <server_id> [options]
`);
  } else if (subcommand === "get") {
    console.log(`
${colors.bold("forge daemons get")} - Get daemon details

${colors.bold("USAGE:")}
  forge daemons get <daemon_id> --server <server_id>
`);
  } else if (subcommand === "restart") {
    console.log(`
${colors.bold("forge daemons restart")} - Restart a daemon

${colors.bold("USAGE:")}
  forge daemons restart <daemon_id> --server <server_id>
`);
  } else {
    console.log(`
${colors.bold("forge daemons")} - Manage daemons

${colors.bold("USAGE:")}
  forge daemons <subcommand> [options]

${colors.bold("SUBCOMMANDS:")}
  list, ls            List daemons
  get <id>            Get daemon details
  restart <id>        Restart a daemon

${colors.bold("OPTIONS:")}
  --server <id>       Server ID (required)
  -f, --format <fmt>  Output format: json, human, table

Run ${colors.cyan("forge daemons <subcommand> --help")} for details.
`);
  }
}
