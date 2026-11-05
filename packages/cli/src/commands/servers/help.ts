import { colors } from "../../utils/colors.ts";

export function showServersHelp(subcommand?: string): void {
  if (subcommand === "list" || subcommand === "ls") {
    console.log(`
${colors.bold("forge servers list")} - List all servers

${colors.bold("USAGE:")}
  forge servers list [options]

${colors.bold("OPTIONS:")}
  --token <token>     Forge API token
  -f, --format <fmt>  Output format: json, human, table (default: human)
  --no-color          Disable colored output
  -h, --help          Show this help

${colors.bold("EXAMPLES:")}
  forge servers list
  forge servers list --format json
`);
  } else if (subcommand === "get") {
    console.log(`
${colors.bold("forge servers get")} - Get server details

${colors.bold("USAGE:")}
  forge servers get <server_id> [options]

${colors.bold("ARGUMENTS:")}
  <server_id>         Server ID (required)

${colors.bold("OPTIONS:")}
  -f, --format <fmt>  Output format: json, human, table

${colors.bold("EXAMPLES:")}
  forge servers get 123
  forge servers get 123 --format json
`);
  } else if (subcommand === "public-key") {
    console.log(`
${colors.bold("forge servers public-key")} - Print the public key of the forge user

${colors.bold("USAGE:")}
  forge servers public-key <server_id> [options]

${colors.bold("ARGUMENTS:")}
  <server_id>         Server ID or name (required)

${colors.bold("OPTIONS:")}
  -f, --format <fmt>  Output format: json ({ "public_key": "..." }), human (the key only)

Forge clones repositories as the forge user, with this key (~/.ssh/id_rsa.pub).
Add it to the git host (e.g. as a deploy key) before you create a site with a
repository. It is not the key of GET /servers/{id}/key: that key lets Forge
connect to the server.

${colors.bold("EXAMPLES:")}
  forge servers public-key 123
  forge servers public-key 123 > server.pub
`);
  } else if (subcommand === "create") {
    console.log(`
${colors.bold("forge servers create")} - Create a server

${colors.bold("USAGE:")}
  forge servers create --name <name> --ip-address <ip> [options]

${colors.bold("OPTIONS:")}
  --name <name>              Server name (required, 30 characters max)
  --provider <provider>      Server provider (default: custom)
  --ip-address <ip>          Public IP address (required for custom)
  --private-ip <ip>          Private IP address (custom only)
  --ssh-port <port>          SSH port (custom only, default: 22)
  --region <id>              Region ID (cloud providers)
  --size <id>                Size ID (cloud providers)
  --credential-id <id>       Server provider credential ID (cloud providers)
  --type <type>              Server type: app, web, loadbalancer, database... (default: app)
  --ubuntu-version <ver>     Ubuntu version (default: 26.04)
  --php-version <ver>        PHP version (default: php84)
  --database <type>          Database type, e.g. mariadb1011
  --tag <tag>                Tag, repeatable
  -f, --format <fmt>         Output format: json, human, table

A Custom VPS must run a fresh Ubuntu with root SSH access. After the
command, run the provisioning command from the Forge server page as root.

${colors.bold("EXAMPLES:")}
  forge servers create --name web-1 --ip-address 203.0.113.10 --php-version php84 --database mariadb1011
  forge servers create --name worker-1 --provider hetzner --credential-id 42 --region fsn1 --size cpx31
`);
  } else if (subcommand === "reboot") {
    console.log(`
${colors.bold("forge servers reboot")} - Reboot a server

${colors.bold("USAGE:")}
  forge servers reboot <server_id> [options]

${colors.bold("ARGUMENTS:")}
  <server_id>         Server ID (required)

${colors.bold("EXAMPLES:")}
  forge servers reboot 123
`);
  } else {
    console.log(`
${colors.bold("forge servers")} - Manage servers

${colors.bold("USAGE:")}
  forge servers <subcommand> [options]

${colors.bold("ALIASES:")}
  forge s

${colors.bold("SUBCOMMANDS:")}
  list, ls            List all servers
  get <id>            Get server details
  public-key <id>     Print the public key of the forge user
  create              Create a server (requires --name, and --ip-address for custom)
  reboot <id>         Reboot a server

${colors.bold("OPTIONS:")}
  -f, --format <fmt>  Output format: json, human, table
  -h, --help          Show help for a subcommand

${colors.bold("EXAMPLES:")}
  forge servers list
  forge servers get 123

Run ${colors.cyan("forge servers <subcommand> --help")} for subcommand details.
`);
  }
}
