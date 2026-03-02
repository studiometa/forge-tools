import { colors } from "../../utils/colors.ts";

export function showMonitorsHelp(subcommand?: string): void {
  if (subcommand === "list" || subcommand === "ls") {
    console.log(`
${colors.bold("forge monitors list")} - List monitors on a server

${colors.bold("USAGE:")}
  forge monitors list --server <server_id> [options]

${colors.bold("OPTIONS:")}
  --server <id>       Server ID (required)
  -f, --format <fmt>  Output format: json, human, table
`);
  } else if (subcommand === "get") {
    console.log(`
${colors.bold("forge monitors get")} - Get monitor details

${colors.bold("USAGE:")}
  forge monitors get <monitor_id> --server <server_id> [options]
`);
  } else if (subcommand === "create") {
    console.log(`
${colors.bold("forge monitors create")} - Create a new monitor

${colors.bold("USAGE:")}
  forge monitors create --server <server_id> --type <type> --operator <operator> --threshold <threshold> --minutes <minutes> [options]

${colors.bold("OPTIONS:")}
  --server <id>         Server ID (required)
  --type <type>         Monitor type (required)
  --operator <op>       Comparison operator (required)
  --threshold <num>     Alert threshold value (required)
  --minutes <num>       Duration in minutes (required)
  -f, --format <fmt>    Output format: json, human, table
`);
  } else if (subcommand === "delete") {
    console.log(`
${colors.bold("forge monitors delete")} - Delete a monitor

${colors.bold("USAGE:")}
  forge monitors delete <monitor_id> --server <server_id> [options]
`);
  } else {
    console.log(`
${colors.bold("forge monitors")} - Manage server monitors

${colors.bold("USAGE:")}
  forge monitors <subcommand> [options]

${colors.bold("SUBCOMMANDS:")}
  list, ls            List monitors
  get <id>            Get monitor details
  create              Create a new monitor
  delete <id>         Delete a monitor

${colors.bold("OPTIONS:")}
  --server <id>       Server ID (required)
  -f, --format <fmt>  Output format: json, human, table

Run ${colors.cyan("forge monitors <subcommand> --help")} for details.
`);
  }
}
