import { colors } from "../../utils/colors.ts";

export function showCertificatesHelp(subcommand?: string): void {
  if (subcommand === "list" || subcommand === "ls") {
    console.log(`
${colors.bold("forge-cli certificates list")} - List certificates for a site

${colors.bold("USAGE:")}
  forge-cli certificates list --server <server_id> --site <site_id> [options]
`);
  } else if (subcommand === "get") {
    console.log(`
${colors.bold("forge-cli certificates get")} - Get certificate details

${colors.bold("USAGE:")}
  forge-cli certificates get <cert_id> --server <server_id> --site <site_id>
`);
  } else if (subcommand === "activate") {
    console.log(`
${colors.bold("forge-cli certificates activate")} - Activate a certificate

${colors.bold("USAGE:")}
  forge-cli certificates activate <cert_id> --server <server_id> --site <site_id>
`);
  } else {
    console.log(`
${colors.bold("forge-cli certificates")} - Manage SSL certificates

${colors.bold("USAGE:")}
  forge-cli certificates <subcommand> [options]

${colors.bold("ALIASES:")}
  forge-cli certs

${colors.bold("SUBCOMMANDS:")}
  list, ls            List certificates
  get <id>            Get certificate details
  activate <id>       Activate a certificate

${colors.bold("OPTIONS:")}
  --server <id>       Server ID (required)
  --site <id>         Site ID (required)
  -f, --format <fmt>  Output format: json, human, table

Run ${colors.cyan("forge-cli certificates <subcommand> --help")} for details.
`);
  }
}
