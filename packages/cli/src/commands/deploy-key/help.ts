import { colors } from "../../utils/colors.ts";

export function showDeployKeyHelp(subcommand?: string): void {
  if (subcommand === "get" || subcommand === "create" || subcommand === "delete") {
    const what = {
      get: "Print the deploy key of a site",
      create: "Create a deploy key for a site (or get the one it has) and print it",
      delete: "Delete the deploy key of a site",
    }[subcommand];
    console.log(`
${colors.bold(`forge deploy-key ${subcommand}`)} - ${what}

${colors.bold("USAGE:")}
  forge deploy-key ${subcommand} --server <server_id> --site <site_id>
`);
  } else {
    console.log(`
${colors.bold("forge deploy-key")} - Manage the deploy key of a site

A deploy key is a public key that only this site uses to clone its repository:
add it to the repository on the git host.

${colors.bold("USAGE:")}
  forge deploy-key <subcommand> --server <server_id> --site <site_id>

${colors.bold("SUBCOMMANDS:")}
  get                 Print the deploy key
  create              Create a deploy key and print it
  delete              Delete the deploy key

${colors.bold("OPTIONS:")}
  -f, --format <fmt>  Output format: json ({ "key": "..." }), human (the key only)
`);
  }
}
