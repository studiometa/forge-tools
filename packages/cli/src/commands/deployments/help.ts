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
  } else if (subcommand === "logs" || subcommand === "log") {
    console.log(`
${colors.bold("forge deployments logs")} - Show output of a deployment (latest if no id)

${colors.bold("USAGE:")}
  forge deployments logs [deployment_id] --server <server_id> --site <site_id>

${colors.bold("OPTIONS:")}
  --server <id>       Server ID (required)
  --site <id>         Site ID (required)
  -f, --format <fmt>  Output format: json, human, table
`);
  } else if (subcommand === "script") {
    console.log(`
${colors.bold("forge deployments script")} - Show the deployment script of a site

${colors.bold("USAGE:")}
  forge deployments script --server <server_id> --site <site_id>

${colors.bold("OPTIONS:")}
  --server <id>       Server ID (required)
  --site <id>         Site ID (required)
  -f, --format <fmt>  Output format: json ({ content }), human (raw script)

${colors.bold("EXAMPLES:")}
  forge deployments script --server 123 --site 456 > deploy.sh
`);
  } else if (subcommand === "update-script") {
    console.log(`
${colors.bold("forge deployments update-script")} - Update the deployment script of a site

${colors.bold("USAGE:")}
  forge deployments update-script --server <server_id> --site <site_id> --file <path>
  forge deployments update-script --server <server_id> --site <site_id> --content <script>

${colors.bold("OPTIONS:")}
  --server <id>       Server ID (required)
  --site <id>         Site ID (required)
  --file <path>       Read the script from a file (use - for stdin)
  --content <str>     Script content
  -f, --format <fmt>  Output format: json, human

  Give exactly one of --file or --content. An empty script is rejected.

${colors.bold("EXAMPLES:")}
  forge deployments update-script --server 123 --site 456 --file deploy.sh
  cat deploy.sh | forge deployments update-script --server 123 --site 456 --file -
`);
  } else if (subcommand === "deploy") {
    console.log(`
${colors.bold("forge deployments deploy")} - Trigger a deployment

${colors.bold("USAGE:")}
  forge deployments deploy --server <server_id> --site <site_id> [options]

${colors.bold("OPTIONS:")}
  --server <id>         Server ID (required)
  --site <id>           Site ID (required)
  --script-file <path>  Upload this deployment script before deploying (use - for stdin).
                        If the upload fails, the deployment does not start.
  --stream              Stream deployment logs in real-time (default: show progress)
  -f, --format <fmt>    Output format: json, human, table
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
  logs                Show output of a deployment (latest if no id)
  script              Show the deployment script
  update-script       Update the deployment script from a file, stdin or a string

${colors.bold("OPTIONS:")}
  --server <id>         Server ID (required)
  --site <id>           Site ID (required)
  --file <path>         Script file, - for stdin (for update-script)
  --content <str>       Script content (for update-script)
  --script-file <path>  Upload this script before deploying (for deploy)
  -f, --format <fmt>    Output format: json, human, table

Run ${colors.cyan("forge deployments <subcommand> --help")} for details.
`);
  }
}
