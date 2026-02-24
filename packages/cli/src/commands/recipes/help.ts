import { colors } from "../../utils/colors.ts";

export function showRecipesHelp(subcommand?: string): void {
  if (subcommand === "list" || subcommand === "ls") {
    console.log(`
${colors.bold("forge-cli recipes list")} - List all recipes

${colors.bold("USAGE:")}
  forge-cli recipes list [options]
`);
  } else if (subcommand === "get") {
    console.log(`
${colors.bold("forge-cli recipes get")} - Get recipe details

${colors.bold("USAGE:")}
  forge-cli recipes get <recipe_id>
`);
  } else if (subcommand === "run") {
    console.log(`
${colors.bold("forge-cli recipes run")} - Run a recipe on servers

${colors.bold("USAGE:")}
  forge-cli recipes run <recipe_id> --servers <server_id1,server_id2,...>

${colors.bold("OPTIONS:")}
  --servers <ids>     Comma-separated server IDs to run recipe on
`);
  } else {
    console.log(`
${colors.bold("forge-cli recipes")} - Manage recipes

${colors.bold("USAGE:")}
  forge-cli recipes <subcommand> [options]

${colors.bold("SUBCOMMANDS:")}
  list, ls            List all recipes
  get <id>            Get recipe details
  run <id>            Run a recipe on servers

${colors.bold("OPTIONS:")}
  -f, --format <fmt>  Output format: json, human, table

Run ${colors.cyan("forge-cli recipes <subcommand> --help")} for details.
`);
  }
}
