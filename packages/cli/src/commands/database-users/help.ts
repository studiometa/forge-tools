import { colors } from "../../utils/colors.ts";

export function showDatabaseUsersHelp(subcommand?: string): void {
  if (subcommand === "list" || subcommand === "ls") {
    console.log(`
${colors.bold("forge database-users list")} - List database users on a server

${colors.bold("USAGE:")}
  forge database-users list --server <server_id> [options]

${colors.bold("OPTIONS:")}
  --server <id>       Server ID (required)
  -f, --format <fmt>  Output format: json, human, table
`);
  } else if (subcommand === "get") {
    console.log(`
${colors.bold("forge database-users get")} - Get database user details

${colors.bold("USAGE:")}
  forge database-users get <user_id> --server <server_id> [options]
`);
  } else if (subcommand === "create") {
    console.log(`
${colors.bold("forge database-users create")} - Create a new database user

${colors.bold("USAGE:")}
  forge database-users create --server <server_id> --name <name> --password <password> [options]

${colors.bold("OPTIONS:")}
  --server <id>       Server ID (required)
  --name <name>       Database user name (required)
  --password <pass>   User password (required)
  --databases <ids>   Comma-separated database IDs to grant access to (optional)
  -f, --format <fmt>  Output format: json, human, table
`);
  } else if (subcommand === "delete") {
    console.log(`
${colors.bold("forge database-users delete")} - Delete a database user

${colors.bold("USAGE:")}
  forge database-users delete <user_id> --server <server_id> [options]
`);
  } else {
    console.log(`
${colors.bold("forge database-users")} - Manage database users

${colors.bold("USAGE:")}
  forge database-users <subcommand> [options]

${colors.bold("SUBCOMMANDS:")}
  list, ls            List database users
  get <id>            Get database user details
  create              Create a new database user
  delete <id>         Delete a database user

${colors.bold("OPTIONS:")}
  --server <id>       Server ID (required)
  -f, --format <fmt>  Output format: json, human, table

Run ${colors.cyan("forge database-users <subcommand> --help")} for details.
`);
  }
}
