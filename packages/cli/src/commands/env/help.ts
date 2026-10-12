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
  forge env update --server <server_id> --site <site_id> --file <path>
  forge env update --server <server_id> --site <site_id> --content <env_content>

${colors.bold("OPTIONS:")}
  --server <id>       Server ID (required)
  --site <id>         Site ID (required)
  --file <path>       Read the content from a file (use - for stdin)
  --content <str>     New env content
  -f, --format <fmt>  Output format: json, human

  Give exactly one of --file or --content. Empty content is rejected.

${colors.bold("EXAMPLES:")}
  forge env update --server 123 --site 456 --file .env
  cat .env | forge env update --server 123 --site 456 --file -
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
  --file <path>       Content file, - for stdin (for update)
  --content <str>     New env content (for update)
  -f, --format <fmt>  Output format: json, human

Run ${colors.cyan("forge env <subcommand> --help")} for details.
`);
  }
}
