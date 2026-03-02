import { colors } from "../../utils/colors.ts";

export function showNginxHelp(subcommand?: string): void {
  if (subcommand === "get") {
    console.log(`
${colors.bold("forge nginx get")} - Get nginx configuration

${colors.bold("USAGE:")}
  forge nginx get --server <server_id> --site <site_id>
`);
  } else if (subcommand === "update") {
    console.log(`
${colors.bold("forge nginx update")} - Update nginx configuration

${colors.bold("USAGE:")}
  forge nginx update --server <server_id> --site <site_id> --content <nginx_config>
`);
  } else {
    console.log(`
${colors.bold("forge nginx")} - Manage nginx configuration

${colors.bold("USAGE:")}
  forge nginx <subcommand> [options]

${colors.bold("SUBCOMMANDS:")}
  get                 Get nginx configuration
  update              Update nginx configuration

${colors.bold("OPTIONS:")}
  --server <id>       Server ID (required)
  --site <id>         Site ID (required)
  --content <str>     New nginx config (for update)

Run ${colors.cyan("forge nginx <subcommand> --help")} for details.
`);
  }
}
