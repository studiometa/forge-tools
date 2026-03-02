import { colors } from "../../utils/colors.ts";

export function showSitesHelp(subcommand?: string): void {
  if (subcommand === "list" || subcommand === "ls") {
    console.log(`
${colors.bold("forge sites list")} - List sites on a server

${colors.bold("USAGE:")}
  forge sites list --server <server_id> [options]

${colors.bold("OPTIONS:")}
  --server <id>       Server ID (required)
  -f, --format <fmt>  Output format: json, human, table

${colors.bold("EXAMPLES:")}
  forge sites list --server 123
  forge sites list --server 123 --format json
`);
  } else if (subcommand === "get") {
    console.log(`
${colors.bold("forge sites get")} - Get site details

${colors.bold("USAGE:")}
  forge sites get <site_id> --server <server_id> [options]

${colors.bold("ARGUMENTS:")}
  <site_id>           Site ID (required)

${colors.bold("OPTIONS:")}
  --server <id>       Server ID (required)
  -f, --format <fmt>  Output format: json, human, table
`);
  } else {
    console.log(`
${colors.bold("forge sites")} - Manage sites

${colors.bold("USAGE:")}
  forge sites <subcommand> [options]

${colors.bold("SUBCOMMANDS:")}
  list, ls            List sites on a server
  get <id>            Get site details

${colors.bold("OPTIONS:")}
  --server <id>       Server ID (required for most commands)
  -f, --format <fmt>  Output format: json, human, table
  -h, --help          Show help for a subcommand

${colors.bold("EXAMPLES:")}
  forge sites list --server 123
  forge sites get 456 --server 123

Run ${colors.cyan("forge sites <subcommand> --help")} for subcommand details.
`);
  }
}
