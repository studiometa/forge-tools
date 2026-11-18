import { colors } from "../../utils/colors.ts";

export function showGitHelp(): void {
  console.log(`
${colors.bold("forge git update")} - Change the repository that a site deploys from

${colors.bold("USAGE:")}
  forge git update --server <server_id> --site <site_id> --repository <repo> --branch <branch> [options]

${colors.bold("OPTIONS:")}
  --repository <repo>  Repository, e.g. acme/app (required)
  --branch <branch>    Branch to deploy (required)
  --provider <name>    github (default), gitlab, bitbucket, gitlab-custom or custom
  -f, --format <fmt>   Output format: json, human, table

${colors.bold("EXAMPLES:")}
  forge git update --server web-1 --site example.com --repository acme/app --branch release
`);
}
