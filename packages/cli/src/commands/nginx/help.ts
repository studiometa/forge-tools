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
  forge nginx update --server <server_id> --site <site_id> --file <path>
  forge nginx update --server <server_id> --site <site_id> --content <nginx_config>

${colors.bold("OPTIONS:")}
  --server <id>       Server ID (required)
  --site <id>         Site ID (required)
  --file <path>       Read the content from a file (use - for stdin)
  --content <str>     New nginx config
  -f, --format <fmt>  Output format: json, human

  Give exactly one of --file or --content. Empty content is rejected.

${colors.bold("EXAMPLES:")}
  forge nginx update --server 123 --site 456 --file nginx.conf
  cat nginx.conf | forge nginx update --server 123 --site 456 --file -
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
  --file <path>       Content file, - for stdin (for update)
  --content <str>     New nginx config (for update)

Run ${colors.cyan("forge nginx <subcommand> --help")} for details.
`);
  }
}
