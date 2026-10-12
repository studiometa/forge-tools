import { colors } from "../../utils/colors.ts";

export function showSshKeysHelp(subcommand?: string): void {
  if (subcommand === "list" || subcommand === "ls") {
    console.log(`
${colors.bold("forge ssh-keys list")} - List SSH keys on a server

${colors.bold("USAGE:")}
  forge ssh-keys list --server <server_id> [options]
`);
  } else if (subcommand === "get") {
    console.log(`
${colors.bold("forge ssh-keys get")} - Get SSH key details

${colors.bold("USAGE:")}
  forge ssh-keys get <key_id> --server <server_id>
`);
  } else if (subcommand === "sync") {
    console.log(`
${colors.bold("forge ssh-keys sync")} - Make the SSH keys of servers match a file

${colors.bold("USAGE:")}
  forge ssh-keys sync --file <path|-> --server <id> [--server <id>...] [options]
  forge ssh-keys sync --file <path|-> --all-servers [options]

${colors.bold("OPTIONS:")}
  --file <path>       authorized_keys file: one "<type> <base64> [comment]" per line,
                      blank lines and # comments ignored (use - for stdin)
  --server <id>       Target server ID or name (repeatable or comma separated)
  --all-servers       Target every server in the organization
  --user <name>       Server user of the keys (default: forge)
  --prune             Also remove the keys of the user that are not in the file
  --dry-run           Print the plan and change nothing
  -f, --format <fmt>  Output format: json, human

${colors.bold("HOW IT WORKS:")}
  Each key gets the name "<comment slug>-<first 8 hex chars of SHA-256 of the key>".
  The Forge API does not return public keys, so keys are matched by name: a changed
  key gets a new name. The command lists the plan per server (+ add, - remove,
  = unchanged), applies it, then prints the result. Without --prune, keys are only
  added. Servers run one after the other; when an operation fails, the others still
  run and the command exits non-zero.

${colors.bold("EXAMPLES:")}
  forge ssh-keys sync --file .forge/authorized_keys --server 123 --dry-run
  forge ssh-keys sync --file .forge/authorized_keys --all-servers --prune
  cat keys.pub | forge ssh-keys sync --file - --server web-1,web-2 --user deploy
`);
  } else {
    console.log(`
${colors.bold("forge ssh-keys")} - Manage SSH keys

${colors.bold("USAGE:")}
  forge ssh-keys <subcommand> [options]

${colors.bold("SUBCOMMANDS:")}
  list, ls            List SSH keys
  get <id>            Get SSH key details
  sync                Make the SSH keys of servers match a file

${colors.bold("OPTIONS:")}
  --server <id>       Server ID (required)
  --file <path>       authorized_keys file, - for stdin (for sync)
  -f, --format <fmt>  Output format: json, human, table

Run ${colors.cyan("forge ssh-keys <subcommand> --help")} for details.
`);
  }
}
