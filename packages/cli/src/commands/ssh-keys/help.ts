import { colors } from "../../utils/colors.ts";

export function showSshKeysHelp(subcommand?: string): void {
  if (subcommand === "list" || subcommand === "ls") {
    console.log(`
${colors.bold("forge-cli ssh-keys list")} - List SSH keys on a server

${colors.bold("USAGE:")}
  forge-cli ssh-keys list --server <server_id> [options]
`);
  } else if (subcommand === "get") {
    console.log(`
${colors.bold("forge-cli ssh-keys get")} - Get SSH key details

${colors.bold("USAGE:")}
  forge-cli ssh-keys get <key_id> --server <server_id>
`);
  } else {
    console.log(`
${colors.bold("forge-cli ssh-keys")} - Manage SSH keys

${colors.bold("USAGE:")}
  forge-cli ssh-keys <subcommand> [options]

${colors.bold("SUBCOMMANDS:")}
  list, ls            List SSH keys
  get <id>            Get SSH key details

${colors.bold("OPTIONS:")}
  --server <id>       Server ID (required)
  -f, --format <fmt>  Output format: json, human, table

Run ${colors.cyan("forge-cli ssh-keys <subcommand> --help")} for details.
`);
  }
}
