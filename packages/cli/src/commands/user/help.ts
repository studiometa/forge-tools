import { colors } from "../../utils/colors.ts";

export function showUserHelp(subcommand?: string): void {
  if (subcommand === "get") {
    console.log(`
${colors.bold("forge-cli user get")} - Get the authenticated user profile

${colors.bold("USAGE:")}
  forge-cli user get [options]

${colors.bold("OPTIONS:")}
  -f, --format <fmt>  Output format: json, human, table
`);
  } else {
    console.log(`
${colors.bold("forge-cli user")} - Display authenticated user profile

${colors.bold("USAGE:")}
  forge-cli user [subcommand] [options]

${colors.bold("SUBCOMMANDS:")}
  get                 Get the authenticated user profile

${colors.bold("OPTIONS:")}
  -f, --format <fmt>  Output format: json, human, table

Run ${colors.cyan("forge-cli user <subcommand> --help")} for details.
`);
  }
}
