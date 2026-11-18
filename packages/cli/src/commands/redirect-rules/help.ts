import { colors } from "../../utils/colors.ts";

export function showRedirectRulesHelp(subcommand?: string): void {
  if (subcommand === "list" || subcommand === "ls") {
    console.log(`
${colors.bold("forge redirect-rules list")} - List redirect rules for a site

${colors.bold("USAGE:")}
  forge redirect-rules list --server <server_id> --site <site_id> [options]

${colors.bold("OPTIONS:")}
  --server <id>       Server ID (required)
  --site <id>         Site ID (required)
  -f, --format <fmt>  Output format: json, human, table
`);
  } else if (subcommand === "get") {
    console.log(`
${colors.bold("forge redirect-rules get")} - Get redirect rule details

${colors.bold("USAGE:")}
  forge redirect-rules get <rule_id> --server <server_id> --site <site_id> [options]
`);
  } else if (subcommand === "create") {
    console.log(`
${colors.bold("forge redirect-rules create")} - Create a new redirect rule

${colors.bold("USAGE:")}
  forge redirect-rules create --server <server_id> --site <site_id> --from <from> --to <to> [options]

${colors.bold("OPTIONS:")}
  --server <id>         Server ID (required)
  --site <id>           Site ID (required)
  --from <path>         Source path to redirect from (required)
  --to <path>           Destination path to redirect to (required)
  -f, --format <fmt>    Output format: json, human, table
`);
  } else if (subcommand === "export") {
    console.log(`
${colors.bold("forge redirect-rules export")} - Export the redirect rules as CSV

${colors.bold("USAGE:")}
  forge redirect-rules export --server <server_id> --site <site_id> [--output <file>]

Prints the CSV (from,to,type header row), or writes it to --output.
`);
  } else if (subcommand === "import") {
    console.log(`
${colors.bold("forge redirect-rules import")} - Import redirect rules from a CSV file

${colors.bold("USAGE:")}
  forge redirect-rules import --server <server_id> --site <site_id> --file <path|-> [--mode append|replace]

${colors.bold("OPTIONS:")}
  --file <path|->       CSV file with a from,to,type header row (- reads stdin)
  --mode <mode>         append (default) adds the rules, replace replaces the rules of the site
`);
  } else if (subcommand === "reorder") {
    console.log(`
${colors.bold("forge redirect-rules reorder")} - Set the order of the redirect rules

${colors.bold("USAGE:")}
  forge redirect-rules reorder --server <server_id> --site <site_id> --ids <id,id,...>

--ids lists every redirect rule ID of the site, in order.
`);
  } else if (subcommand === "delete") {
    console.log(`
${colors.bold("forge redirect-rules delete")} - Delete a redirect rule

${colors.bold("USAGE:")}
  forge redirect-rules delete <rule_id> --server <server_id> --site <site_id> [options]
`);
  } else {
    console.log(`
${colors.bold("forge redirect-rules")} - Manage site redirect rules

${colors.bold("USAGE:")}
  forge redirect-rules <subcommand> [options]

${colors.bold("SUBCOMMANDS:")}
  list, ls            List redirect rules
  get <id>            Get redirect rule details
  create              Create a new redirect rule
  delete <id>         Delete a redirect rule
  export              Export the redirect rules as CSV
  import              Import redirect rules from a CSV file
  reorder             Set the order of the redirect rules

${colors.bold("OPTIONS:")}
  --server <id>       Server ID (required)
  --site <id>         Site ID (required)
  -f, --format <fmt>  Output format: json, human, table

Run ${colors.cyan("forge redirect-rules <subcommand> --help")} for details.
`);
  }
}
