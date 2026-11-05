import { colors } from "../../utils/colors.ts";

export function showSitesHelp(subcommand?: string): void {
  if (subcommand === "list" || subcommand === "ls") {
    console.log(`
${colors.bold("forge sites list")} - List sites on a server

${colors.bold("USAGE:")}
  forge sites list --server <server_id> [options]

${colors.bold("OPTIONS:")}
  --server <id>       Server ID (required)
  -f, --format <fmt>  Output format: json, human, table

${colors.bold("EXAMPLES:")}
  forge sites list --server 123
  forge sites list --server 123 --format json
`);
  } else if (subcommand === "get") {
    console.log(`
${colors.bold("forge sites get")} - Get site details

${colors.bold("USAGE:")}
  forge sites get <site_id> --server <server_id> [options]

${colors.bold("ARGUMENTS:")}
  <site_id>           Site ID (required)

${colors.bold("OPTIONS:")}
  --server <id>       Server ID (required)
  -f, --format <fmt>  Output format: json, human, table
`);
  } else if (subcommand === "apply") {
    console.log(`
${colors.bold("forge sites apply")} - Make a site match a site file

${colors.bold("USAGE:")}
  forge sites apply --file <site.json> [--check] [options]

${colors.bold("OPTIONS:")}
  --file <path>       Site file (required), e.g. config/forge/production/site.json
  --check             Print the plan and change nothing: exit 0 when Forge matches,
                      exit 1 when it differs, another code on error
  -f, --format <fmt>  Output format: json, human

${colors.bold("SITE FILE:")}
  Only "server" (exact name or ID) and "domain" (exact site name) are required.
  A key that is absent is not managed: apply does not read or change it.
    type, php, webDirectory, repository   Create the site, or update php, web directory, branch
    aliases                               Add missing aliases, never remove one
    database { name, user }               Create when missing; a new user gets a random
                                          password, written into the site .env only
    env                                   Add missing keys, never overwrite a value
    workers, schedule                     Create missing ones, delete the ones of the site
                                          that the file does not declare ([] deletes all)

  A worker or scheduled job is deleted only when it surely belongs to the site:
  Forge lists it on the site, or its directory (or, without a directory, its command)
  uses the site path, compared on whole path segments. Jobs of root are never deleted.
  The plan never prints .env values.

${colors.bold("EXAMPLES:")}
  forge sites apply --file config/forge/production/site.json --check
  forge sites apply --file config/forge/production/site.json
`);
  } else {
    console.log(`
${colors.bold("forge sites")} - Manage sites

${colors.bold("USAGE:")}
  forge sites <subcommand> [options]

${colors.bold("SUBCOMMANDS:")}
  list, ls            List sites on a server
  get <id>            Get site details
  apply               Make a site match a site file (--file, --check)

${colors.bold("OPTIONS:")}
  --server <id>       Server ID (required for most commands)
  -f, --format <fmt>  Output format: json, human, table
  -h, --help          Show help for a subcommand

${colors.bold("EXAMPLES:")}
  forge sites list --server 123
  forge sites get 456 --server 123
  forge sites apply --file config/forge/production/site.json --check

Run ${colors.cyan("forge sites <subcommand> --help")} for subcommand details.
`);
  }
}
