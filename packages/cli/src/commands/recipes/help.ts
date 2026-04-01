import { colors } from "../../utils/colors.ts";

export function showRecipesHelp(subcommand?: string): void {
  if (subcommand === "list" || subcommand === "ls") {
    console.log(`
${colors.bold("forge recipes list")} - List all recipes

${colors.bold("USAGE:")}
  forge recipes list [options]
`);
  } else if (subcommand === "get") {
    console.log(`
${colors.bold("forge recipes get")} - Get recipe details

${colors.bold("USAGE:")}
  forge recipes get <recipe_id>
`);
  } else if (subcommand === "update") {
    console.log(`
${colors.bold("forge recipes update")} - Update a recipe

${colors.bold("USAGE:")}
  forge recipes update <recipe_id> [options]

${colors.bold("OPTIONS:")}
  --name <name>       New recipe name
  --user <user>       New recipe user
  --script <script>   New recipe script
`);
  } else if (subcommand === "run") {
    console.log(`
${colors.bold("forge recipes run")} - Run a recipe on servers

${colors.bold("USAGE:")}
  forge recipes run <recipe_id> --servers <server_id1,server_id2,...>

${colors.bold("OPTIONS:")}
  --servers <ids>     Comma-separated server IDs to run recipe on
`);
  } else {
    console.log(`
${colors.bold("forge recipes")} - Manage recipes

${colors.bold("USAGE:")}
  forge recipes <subcommand> [options]

${colors.bold("SUBCOMMANDS:")}
  list, ls            List all recipes
  get <id>            Get recipe details
  update <id>         Update a recipe
  run <id>            Run a recipe on servers

${colors.bold("OPTIONS:")}
  -f, --format <fmt>  Output format: json, human, table

Run ${colors.cyan("forge recipes <subcommand> --help")} for details.
`);
  }
}
