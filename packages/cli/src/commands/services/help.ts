import { colors } from "../../utils/colors.ts";

export function showServicesHelp(subcommand?: string): void {
  if (subcommand === "list" || subcommand === "ls") {
    console.log(`
${colors.bold("forge services list")} - List services on a server

${colors.bold("USAGE:")}
  forge services list <server> [options]

${colors.bold("ARGUMENTS:")}
  <server>            Server ID or name (required)

${colors.bold("NOTES:")}
  Availability is a heuristic derived from the server object — the API has
  no services listing endpoint.

${colors.bold("EXAMPLES:")}
  forge services list 123
  forge services list my-server --format json
`);
  } else if (subcommand === "restart") {
    console.log(`
${colors.bold("forge services restart")} - Restart a service on a server

${colors.bold("USAGE:")}
  forge services restart <server> <service> [options]

${colors.bold("ARGUMENTS:")}
  <server>            Server ID or name (required)
  <service>           One of: nginx, php, mysql, postgres, redis, supervisor

${colors.bold("OPTIONS:")}
  --version <ver>     PHP version (e.g. php83) — required for the php service
                        (defaults to the server's php_version when omitted)

${colors.bold("EXAMPLES:")}
  forge services restart 123 nginx
  forge services restart 123 php --version php83
`);
  } else {
    console.log(`
${colors.bold("forge services")} - List and restart server services

${colors.bold("USAGE:")}
  forge services <subcommand> [options]

${colors.bold("SUBCOMMANDS:")}
  list, ls            List services on a server
  restart <service>   Restart a service (nginx, php, mysql, postgres, redis, supervisor)

${colors.bold("OPTIONS:")}
  --version <ver>     PHP version (for the php service)
  -f, --format <fmt>  Output format: json, human, table

Run ${colors.cyan("forge services <subcommand> --help")} for details.
`);
  }
}
