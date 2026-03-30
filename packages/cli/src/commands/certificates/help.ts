import { colors } from "../../utils/colors.ts";

export function showCertificatesHelp(subcommand?: string): void {
  if (subcommand === "get") {
    console.log(`
${colors.bold("forge certificates get")} - Get certificate for a domain

${colors.bold("USAGE:")}
  forge certificates get --server <server_id> --site <site_id> --domain <domain_id>
`);
  } else if (subcommand === "activate") {
    console.log(`
${colors.bold("forge certificates activate")} - Activate a certificate

${colors.bold("USAGE:")}
  forge certificates activate --server <server_id> --site <site_id> --domain <domain_id>
`);
  } else {
    console.log(`
${colors.bold("forge certificates")} - Manage SSL certificates

${colors.bold("USAGE:")}
  forge certificates <subcommand> [options]

${colors.bold("ALIASES:")}
  forge certs

${colors.bold("SUBCOMMANDS:")}
  get                 Get certificate for a domain
  activate            Activate a certificate

${colors.bold("OPTIONS:")}
  --server <id>       Server ID (required)
  --site <id>         Site ID (required)
  --domain <id>       Domain record ID (required)
  -f, --format <fmt>  Output format: json, human, table

${colors.bold("NOTE:")}
  In Forge v2, certificates are per-domain. Use domains to manage certificates.

Run ${colors.cyan("forge certificates <subcommand> --help")} for details.
`);
  }
}
