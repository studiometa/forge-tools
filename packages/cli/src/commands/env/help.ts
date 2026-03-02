import { colors } from "../../utils/colors.ts";

export function showEnvHelp(subcommand?: string): void {
  if (subcommand === "get") {
    console.log(`
${colors.bold("forge env get")} - Get environment variables

${colors.bold("USAGE:")}
  forge env get --server <server_id> --site <site_id>
`);
  } else if (subcommand === "update") {
    console.log(`
${colors.bold("forge env update")} - Update environment variables

${colors.bold("USAGE:")}
  forge env update --server <server_id> --site <site_id> --content <env_content>
`);
  } else {
    console.log(`
${colors.bold("forge env")} - Manage environment variables

${colors.bold("USAGE:")}
  forge env <subcommand> [options]

${colors.bold("SUBCOMMANDS:")}
  get                 Get environment variables
  update              Update environment variables

${colors.bold("OPTIONS:")}
  --server <id>       Server ID (required)
  --site <id>         Site ID (required)
  --content <str>     New env content (for update)
  -f, --format <fmt>  Output format: json, human

Run ${colors.cyan("forge env <subcommand> --help")} for details.
`);
  }
}
