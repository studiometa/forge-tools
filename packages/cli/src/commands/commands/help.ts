import { colors } from "../../utils/colors.ts";

export function showCommandsHelp(subcommand?: string): void {
  if (subcommand === "list" || subcommand === "ls") {
    console.log(`
${colors.bold("forge commands list")} - List commands executed on a site

${colors.bold("USAGE:")}
  forge commands list --server <server_id> --site <site_id> [options]

${colors.bold("OPTIONS:")}
  --server <id>       Server ID (required)
  --site <id>         Site ID (required)
  -f, --format <fmt>  Output format: json, human, table
`);
  } else if (subcommand === "get") {
    console.log(`
${colors.bold("forge commands get")} - Get command details

${colors.bold("USAGE:")}
  forge commands get <command_id> --server <server_id> --site <site_id> [options]
`);
  } else if (subcommand === "create") {
    console.log(`
${colors.bold("forge commands create")} - Execute a command on a site

${colors.bold("USAGE:")}
  forge commands create --server <server_id> --site <site_id> --command <command> [options]

${colors.bold("OPTIONS:")}
  --server <id>         Server ID (required)
  --site <id>           Site ID (required)
  --command <cmd>       Command to execute (required)
  -f, --format <fmt>    Output format: json, human, table
`);
  } else {
    console.log(`
${colors.bold("forge commands")} - Manage site commands

${colors.bold("USAGE:")}
  forge commands <subcommand> [options]

${colors.bold("SUBCOMMANDS:")}
  list, ls            List commands
  get <id>            Get command details
  create              Execute a command on a site

${colors.bold("OPTIONS:")}
  --server <id>       Server ID (required)
  --site <id>         Site ID (required)
  -f, --format <fmt>  Output format: json, human, table

Run ${colors.cyan("forge commands <subcommand> --help")} for details.
`);
  }
}
