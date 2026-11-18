import { colors } from "../../utils/colors.ts";

export function showNetworkHelp(subcommand?: string): void {
  if (subcommand === "get") {
    console.log(`
${colors.bold("forge network get")} - List the servers in the network of a server

${colors.bold("USAGE:")}
  forge network get --server <server_id>
`);
  } else if (subcommand === "update") {
    console.log(`
${colors.bold("forge network update")} - Set the network of a server

${colors.bold("USAGE:")}
  forge network update --server <server_id> --servers <id,id,...>

The list of servers (IDs or names) replaces the current network. An empty list
(--servers "") removes every server from the network.
`);
  } else {
    console.log(`
${colors.bold("forge network")} - Manage the network of a server

The servers in the network of a server can reach it on its private IP address.

${colors.bold("USAGE:")}
  forge network <subcommand> --server <server_id> [options]

${colors.bold("SUBCOMMANDS:")}
  get                 List the servers in the network
  update              Set the network (--servers <id,id,...>)

Run ${colors.cyan("forge network <subcommand> --help")} for details.
`);
  }
}
