import { colors } from "../../utils/colors.ts";

export function showBackupsHelp(subcommand?: string): void {
  if (subcommand === "list" || subcommand === "ls") {
    console.log(`
${colors.bold("forge-cli backups list")} - List backup configurations on a server

${colors.bold("USAGE:")}
  forge-cli backups list --server <server_id> [options]

${colors.bold("OPTIONS:")}
  --server <id>       Server ID (required)
  -f, --format <fmt>  Output format: json, human, table
`);
  } else if (subcommand === "get") {
    console.log(`
${colors.bold("forge-cli backups get")} - Get backup configuration details

${colors.bold("USAGE:")}
  forge-cli backups get <backup_id> --server <server_id> [options]
`);
  } else if (subcommand === "create") {
    console.log(`
${colors.bold("forge-cli backups create")} - Create a new backup configuration

${colors.bold("USAGE:")}
  forge-cli backups create --server <server_id> --provider <provider> --frequency <frequency> [options]

${colors.bold("OPTIONS:")}
  --server <id>         Server ID (required)
  --provider <name>     Backup provider (required)
  --frequency <freq>    Backup frequency (required)
  --databases <ids>     Comma-separated database IDs to back up (optional)
  -f, --format <fmt>    Output format: json, human, table
`);
  } else if (subcommand === "delete") {
    console.log(`
${colors.bold("forge-cli backups delete")} - Delete a backup configuration

${colors.bold("USAGE:")}
  forge-cli backups delete <backup_id> --server <server_id> [options]
`);
  } else {
    console.log(`
${colors.bold("forge-cli backups")} - Manage backup configurations

${colors.bold("USAGE:")}
  forge-cli backups <subcommand> [options]

${colors.bold("SUBCOMMANDS:")}
  list, ls            List backup configurations
  get <id>            Get backup configuration details
  create              Create a new backup configuration
  delete <id>         Delete a backup configuration

${colors.bold("OPTIONS:")}
  --server <id>       Server ID (required)
  -f, --format <fmt>  Output format: json, human, table

Run ${colors.cyan("forge-cli backups <subcommand> --help")} for details.
`);
  }
}
