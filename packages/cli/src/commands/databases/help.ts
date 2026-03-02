import { colors } from "../../utils/colors.ts";

export function showDatabasesHelp(subcommand?: string): void {
  if (subcommand === "list" || subcommand === "ls") {
    console.log(`
${colors.bold("forge databases list")} - List databases on a server

${colors.bold("USAGE:")}
  forge databases list --server <server_id> [options]

${colors.bold("OPTIONS:")}
  --server <id>       Server ID (required)
  -f, --format <fmt>  Output format: json, human, table
`);
  } else if (subcommand === "get") {
    console.log(`
${colors.bold("forge databases get")} - Get database details

${colors.bold("USAGE:")}
  forge databases get <database_id> --server <server_id> [options]
`);
  } else {
    console.log(`
${colors.bold("forge databases")} - Manage databases

${colors.bold("USAGE:")}
  forge databases <subcommand> [options]

${colors.bold("ALIASES:")}
  forge db

${colors.bold("SUBCOMMANDS:")}
  list, ls            List databases
  get <id>            Get database details

${colors.bold("OPTIONS:")}
  --server <id>       Server ID (required)
  -f, --format <fmt>  Output format: json, human, table

Run ${colors.cyan("forge databases <subcommand> --help")} for details.
`);
  }
}
