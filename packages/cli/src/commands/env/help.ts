import { colors } from "../../utils/colors.ts";

export function showEnvHelp(subcommand?: string): void {
  if (subcommand === "get") {
    console.log(`
${colors.bold("forge-cli env get")} - Get environment variables

${colors.bold("USAGE:")}
  forge-cli env get --server <server_id> --site <site_id>
`);
  } else if (subcommand === "update") {
    console.log(`
${colors.bold("forge-cli env update")} - Update environment variables

${colors.bold("USAGE:")}
  forge-cli env update --server <server_id> --site <site_id> --content <env_content>
`);
  } else {
    console.log(`
${colors.bold("forge-cli env")} - Manage environment variables

${colors.bold("USAGE:")}
  forge-cli env <subcommand> [options]

${colors.bold("SUBCOMMANDS:")}
  get                 Get environment variables
  update              Update environment variables

${colors.bold("OPTIONS:")}
  --server <id>       Server ID (required)
  --site <id>         Site ID (required)
  --content <str>     New env content (for update)
  -f, --format <fmt>  Output format: json, human

Run ${colors.cyan("forge-cli env <subcommand> --help")} for details.
`);
  }
}
