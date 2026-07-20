import { colors } from "../../utils/colors.ts";

export function showSshHelp(): void {
  console.log(`
${colors.bold("forge ssh")} - Open an SSH session to a server

${colors.bold("USAGE:")}
  forge ssh <server> [command...] [options]

${colors.bold("ARGUMENTS:")}
  <server>            Server ID or name (required)
  [command...]        Optional remote command to run, then exit

${colors.bold("OPTIONS:")}
  --user <name>       SSH user (default: forge)
  --private           Connect over the private IP address
  --port <n>          Override the server's SSH port
  --dry-run           Print the ssh command instead of connecting
  -f, --format json   Print the resolved connection details as JSON
  -h, --help          Show this help

${colors.bold("EXAMPLES:")}
  # Interactive session (connects as forge@<ip>)
  forge ssh my-server

  # Connect as a custom user
  forge ssh my-server --user deploy

  # Use the private network
  forge ssh my-server --private

  # Run a one-off remote command
  forge ssh my-server uptime

  # Just show the command that would run
  forge ssh my-server --dry-run

${colors.bold("NOTES:")}
  Requires your local SSH key to be authorized on the server; this command
  launches ssh, it does not upload keys.
`);
}
