import { colors } from "../../utils/colors.ts";

export function showDeploymentsHelp(subcommand?: string): void {
  if (subcommand === "list" || subcommand === "ls") {
    console.log(`
${colors.bold("forge deployments list")} - List deployments for a site

${colors.bold("USAGE:")}
  forge deployments list --server <server_id> --site <site_id> [options]

${colors.bold("OPTIONS:")}
  --server <id>       Server ID (required)
  --site <id>         Site ID (required)
  -f, --format <fmt>  Output format: json, human, table
`);
  } else if (subcommand === "deploy") {
    console.log(`
${colors.bold("forge deployments deploy")} - Trigger a deployment

${colors.bold("USAGE:")}
  forge deployments deploy --server <server_id> --site <site_id>
`);
  } else {
    console.log(`
${colors.bold("forge deployments")} - Manage deployments

${colors.bold("USAGE:")}
  forge deployments <subcommand> [options]

${colors.bold("ALIASES:")}
  forge d

${colors.bold("SUBCOMMANDS:")}
  list, ls            List deployments for a site
  deploy              Trigger a deployment

${colors.bold("OPTIONS:")}
  --server <id>       Server ID (required)
  --site <id>         Site ID (required)
  -f, --format <fmt>  Output format: json, human, table

Run ${colors.cyan("forge deployments <subcommand> --help")} for details.
`);
  }
}
