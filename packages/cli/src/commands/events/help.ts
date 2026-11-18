import { colors } from "../../utils/colors.ts";

export function showEventsHelp(subcommand?: string): void {
  if (subcommand === "list" || subcommand === "ls") {
    console.log(`
${colors.bold("forge events list")} - List the latest events, newest first

${colors.bold("USAGE:")}
  forge events list [--server <server_id>] [--initiated-by <user_id>] [--ran-as <user>]

${colors.bold("OPTIONS:")}
  --server <id>          Only the events of this server (default: the whole organization)
  --initiated-by <id>    Only the events that this user ID started
  --ran-as <user>        Only the events that ran as this server user, e.g. forge or root
  -f, --format <fmt>     Output format: json, human, table
`);
  } else if (subcommand === "get") {
    console.log(`
${colors.bold("forge events get")} - Get an event of a server

${colors.bold("USAGE:")}
  forge events get <event_id> --server <server_id>
`);
  } else if (subcommand === "output") {
    console.log(`
${colors.bold("forge events output")} - Print the output of an event of a server

${colors.bold("USAGE:")}
  forge events output <event_id> --server <server_id>
`);
  } else {
    console.log(`
${colors.bold("forge events")} - Read the actions that Forge ran on the servers

${colors.bold("USAGE:")}
  forge events <subcommand> [options]

${colors.bold("SUBCOMMANDS:")}
  list, ls            List the latest events of the organization or of a server
  get <id>            Get an event of a server (requires --server)
  output <id>         Print the output of an event (requires --server)

Run ${colors.cyan("forge events <subcommand> --help")} for details.
`);
  }
}
