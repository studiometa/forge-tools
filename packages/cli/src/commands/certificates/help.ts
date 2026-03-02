import { colors } from "../../utils/colors.ts";

export function showCertificatesHelp(subcommand?: string): void {
  if (subcommand === "list" || subcommand === "ls") {
    console.log(`
${colors.bold("forge certificates list")} - List certificates for a site

${colors.bold("USAGE:")}
  forge certificates list --server <server_id> --site <site_id> [options]
`);
  } else if (subcommand === "get") {
    console.log(`
${colors.bold("forge certificates get")} - Get certificate details

${colors.bold("USAGE:")}
  forge certificates get <cert_id> --server <server_id> --site <site_id>
`);
  } else if (subcommand === "activate") {
    console.log(`
${colors.bold("forge certificates activate")} - Activate a certificate

${colors.bold("USAGE:")}
  forge certificates activate <cert_id> --server <server_id> --site <site_id>
`);
  } else {
    console.log(`
${colors.bold("forge certificates")} - Manage SSL certificates

${colors.bold("USAGE:")}
  forge certificates <subcommand> [options]

${colors.bold("ALIASES:")}
  forge certs

${colors.bold("SUBCOMMANDS:")}
  list, ls            List certificates
  get <id>            Get certificate details
  activate <id>       Activate a certificate

${colors.bold("OPTIONS:")}
  --server <id>       Server ID (required)
  --site <id>         Site ID (required)
  -f, --format <fmt>  Output format: json, human, table

Run ${colors.cyan("forge certificates <subcommand> --help")} for details.
`);
  }
}
