import { colors } from "../../utils/colors.ts";

export function showUserHelp(subcommand?: string): void {
  if (subcommand === "get") {
    console.log(`
${colors.bold("forge user get")} - Get the authenticated user profile

${colors.bold("USAGE:")}
  forge user get [options]

${colors.bold("OPTIONS:")}
  -f, --format <fmt>  Output format: json, human, table
`);
  } else {
    console.log(`
${colors.bold("forge user")} - Display authenticated user profile

${colors.bold("USAGE:")}
  forge user [subcommand] [options]

${colors.bold("SUBCOMMANDS:")}
  get                 Get the authenticated user profile

${colors.bold("OPTIONS:")}
  -f, --format <fmt>  Output format: json, human, table

Run ${colors.cyan("forge user <subcommand> --help")} for details.
`);
  }
}
