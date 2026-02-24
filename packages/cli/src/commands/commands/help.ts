import { colors } from "../../utils/colors.ts";

export function showCommandsHelp(subcommand?: string): void {
  if (subcommand === "list" || subcommand === "ls") {
    console.log(`
${colors.bold("forge-cli commands list")} - List commands executed on a site

${colors.bold("USAGE:")}
  forge-cli commands list --server <server_id> --site <site_id> [options]

${colors.bold("OPTIONS:")}
  --server <id>       Server ID (required)
  --site <id>         Site ID (required)
  -f, --format <fmt>  Output format: json, human, table
`);
  } else if (subcommand === "get") {
    console.log(`
${colors.bold("forge-cli commands get")} - Get command details

${colors.bold("USAGE:")}
  forge-cli commands get <command_id> --server <server_id> --site <site_id> [options]
`);
  } else if (subcommand === "create") {
    console.log(`
${colors.bold("forge-cli commands create")} - Execute a command on a site

${colors.bold("USAGE:")}
  forge-cli commands create --server <server_id> --site <site_id> --command <command> [options]

${colors.bold("OPTIONS:")}
  --server <id>         Server ID (required)
  --site <id>           Site ID (required)
  --command <cmd>       Command to execute (required)
  -f, --format <fmt>    Output format: json, human, table
`);
  } else {
    console.log(`
${colors.bold("forge-cli commands")} - Manage site commands

${colors.bold("USAGE:")}
  forge-cli commands <subcommand> [options]

${colors.bold("SUBCOMMANDS:")}
  list, ls            List commands
  get <id>            Get command details
  create              Execute a command on a site

${colors.bold("OPTIONS:")}
  --server <id>       Server ID (required)
  --site <id>         Site ID (required)
  -f, --format <fmt>  Output format: json, human, table

Run ${colors.cyan("forge-cli commands <subcommand> --help")} for details.
`);
  }
}
