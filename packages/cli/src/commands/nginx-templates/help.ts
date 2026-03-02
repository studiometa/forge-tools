import { colors } from "../../utils/colors.ts";

export function showNginxTemplatesHelp(subcommand?: string): void {
  if (subcommand === "list" || subcommand === "ls") {
    console.log(`
${colors.bold("forge nginx-templates list")} - List Nginx templates on a server

${colors.bold("USAGE:")}
  forge nginx-templates list --server <server_id> [options]

${colors.bold("OPTIONS:")}
  --server <id>       Server ID (required)
  -f, --format <fmt>  Output format: json, human, table
`);
  } else if (subcommand === "get") {
    console.log(`
${colors.bold("forge nginx-templates get")} - Get Nginx template details

${colors.bold("USAGE:")}
  forge nginx-templates get <template_id> --server <server_id> [options]
`);
  } else if (subcommand === "create") {
    console.log(`
${colors.bold("forge nginx-templates create")} - Create a new Nginx template

${colors.bold("USAGE:")}
  forge nginx-templates create --server <server_id> --name <name> --content <content> [options]

${colors.bold("OPTIONS:")}
  --server <id>         Server ID (required)
  --name <name>         Template name (required)
  --content <text>      Template content (required)
  -f, --format <fmt>    Output format: json, human, table
`);
  } else if (subcommand === "update") {
    console.log(`
${colors.bold("forge nginx-templates update")} - Update an Nginx template

${colors.bold("USAGE:")}
  forge nginx-templates update <template_id> --server <server_id> [options]

${colors.bold("OPTIONS:")}
  --server <id>         Server ID (required)
  --name <name>         New template name (optional)
  --content <text>      New template content (optional)
  -f, --format <fmt>    Output format: json, human, table
`);
  } else if (subcommand === "delete") {
    console.log(`
${colors.bold("forge nginx-templates delete")} - Delete an Nginx template

${colors.bold("USAGE:")}
  forge nginx-templates delete <template_id> --server <server_id> [options]
`);
  } else {
    console.log(`
${colors.bold("forge nginx-templates")} - Manage Nginx templates

${colors.bold("USAGE:")}
  forge nginx-templates <subcommand> [options]

${colors.bold("SUBCOMMANDS:")}
  list, ls            List Nginx templates
  get <id>            Get Nginx template details
  create              Create a new Nginx template
  update <id>         Update an Nginx template
  delete <id>         Delete an Nginx template

${colors.bold("OPTIONS:")}
  --server <id>       Server ID (required)
  -f, --format <fmt>  Output format: json, human, table

Run ${colors.cyan("forge nginx-templates <subcommand> --help")} for details.
`);
  }
}
