import { colors } from "../../utils/colors.ts";

export function showBackupsHelp(subcommand?: string): void {
  if (subcommand === "list" || subcommand === "ls") {
    console.log(`
${colors.bold("forge backups list")} - List backup configurations on a server

${colors.bold("USAGE:")}
  forge backups list --server <server_id> [options]

${colors.bold("OPTIONS:")}
  --server <id>       Server ID (required)
  -f, --format <fmt>  Output format: json, human, table
`);
  } else if (subcommand === "get") {
    console.log(`
${colors.bold("forge backups get")} - Get backup configuration details

${colors.bold("USAGE:")}
  forge backups get <backup_id> --server <server_id> [options]
`);
  } else if (subcommand === "create") {
    console.log(`
${colors.bold("forge backups create")} - Create a database backup configuration

${colors.bold("USAGE:")}
  forge backups create --server <server> --storage-provider <id|name> --frequency <frequency> --databases <ids|names> [options]

${colors.bold("OPTIONS:")}
  --server <id|name>             Server ID or name (required)
  --storage-provider <id|name>   Storage provider ID or exact name (required, see forge storage-providers list)
  --frequency <freq>             hourly, daily, weekly or custom (required)
  --databases <ids|names>        Database IDs or exact names, comma separated or repeated (required)
  --retention <n>                Number of backups to keep, 1 to 8760 (default: 5)
  --time <HH:MM>                 Daily and weekly: time on the hour or half hour, e.g. 02:00
  --day <0-6>                    Weekly: day of week, 0 is Sunday
  --cron <expr>                  Custom: cron expression
  --bucket <bucket>              Bucket (default: the storage provider bucket)
  --directory <dir>              Directory in the bucket
  --name <name>                  Configuration name
  --notification-email <email>   Email notified when a backup fails
  --include-new-databases        Also back up databases created later
  -f, --format <fmt>             Output format: json, human, table

${colors.bold("EXAMPLE:")}
  forge backups create --server web-1 --storage-provider Backups --frequency daily \\
    --time 02:00 --retention 7 --directory web-1 --databases app,wordpress
`);
  } else if (subcommand === "update") {
    console.log(`
${colors.bold("forge backups update")} - Update a database backup configuration

${colors.bold("USAGE:")}
  forge backups update <backup_id> --server <server> --storage-provider <id|name> --frequency <frequency> --retention <n> --databases <ids|names> [options]

${colors.bold("OPTIONS:")}
  --server <id|name>             Server ID or name (required)
  --storage-provider <id|name>   Storage provider ID or exact name (required)
  --frequency <freq>             hourly, daily, weekly or custom (required)
  --retention <n>                Number of backups to keep, 1 to 8760 (required)
  --databases <ids|names>        Database IDs or exact names, comma separated or repeated (required)
  --time <HH:MM>                 Daily and weekly: time on the hour or half hour
  --day <0-6>                    Weekly: day of week, 0 is Sunday
  --cron <expr>                  Custom: cron expression
  --bucket <bucket>              Bucket
  --directory <dir>              Directory in the bucket
  --name <name>                  Configuration name
  --notification-email <email>   Email notified when a backup fails
  -f, --format <fmt>             Output format: json, human, table
`);
  } else if (subcommand === "delete") {
    console.log(`
${colors.bold("forge backups delete")} - Delete a backup configuration

${colors.bold("USAGE:")}
  forge backups delete <backup_id> --server <server_id> [options]
`);
  } else {
    console.log(`
${colors.bold("forge backups")} - Manage backup configurations

${colors.bold("USAGE:")}
  forge backups <subcommand> [options]

${colors.bold("SUBCOMMANDS:")}
  list, ls            List backup configurations
  get <id>            Get backup configuration details
  create              Create a new backup configuration
  update <id>         Update a backup configuration
  delete <id>         Delete a backup configuration

${colors.bold("OPTIONS:")}
  --server <id>       Server ID (required)
  -f, --format <fmt>  Output format: json, human, table

Run ${colors.cyan("forge backups <subcommand> --help")} for details.
`);
  }
}
