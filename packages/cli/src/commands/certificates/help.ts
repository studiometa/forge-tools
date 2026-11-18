import { colors } from "../../utils/colors.ts";

export function showCertificatesHelp(subcommand?: string): void {
  if (subcommand === "list" || subcommand === "ls") {
    console.log(`
${colors.bold("forge certificates list")} - List certificates

${colors.bold("USAGE:")}
  forge certificates list --server <server_id> --site <site_id> [--domain <domain_id>]

Without --domain, lists the certificates of every domain of the site.
`);
  } else if (subcommand === "get") {
    console.log(`
${colors.bold("forge certificates get")} - Get a certificate of a domain

${colors.bold("USAGE:")}
  forge certificates get [certificate_id] --server <server_id> --site <site_id> --domain <domain_id>

Without a certificate ID, gets the active certificate of the domain.
`);
  } else if (subcommand === "create") {
    console.log(`
${colors.bold("forge certificates create")} - Create a certificate for a domain

${colors.bold("USAGE:")}
  forge certificates create --server <server_id> --site <site_id> --domain <domain_id> --type <type> [options]

${colors.bold("TYPES AND OPTIONS:")}
  --type letsencrypt (default)
    --verification-method <m>  http-01 (default) or dns-01
    --key-type <type>          ecdsa (default) or rsa
  --type existing
    --key-file <path>          Private key file (required)
    --certificate-file <path>  Certificate chain file (required)
  --type csr
    --csr-domain <domain>      Domain of the signing request (required)
    --sans <a,b>               Other domains, comma-separated
    --country, --state, --city, --organization, --department (required)
  --type clone
    --certificate-id <id>      Certificate to clone (required)
  --enable                     Activate the certificate once installed (existing, clone)
`);
  } else if (subcommand === "delete") {
    console.log(`
${colors.bold("forge certificates delete")} - Delete a certificate

${colors.bold("USAGE:")}
  forge certificates delete <certificate_id> --server <server_id> --site <site_id> --domain <domain_id>
`);
  } else if (subcommand === "deactivate") {
    console.log(`
${colors.bold("forge certificates deactivate")} - Deactivate a certificate

${colors.bold("USAGE:")}
  forge certificates deactivate <certificate_id> --server <server_id> --site <site_id> --domain <domain_id>
`);
  } else if (subcommand === "activate") {
    console.log(`
${colors.bold("forge certificates activate")} - Activate a certificate

${colors.bold("USAGE:")}
  forge certificates activate <certificate_id> --server <server_id> --site <site_id> --domain <domain_id>
`);
  } else {
    console.log(`
${colors.bold("forge certificates")} - Manage SSL certificates

${colors.bold("USAGE:")}
  forge certificates <subcommand> [options]

${colors.bold("ALIASES:")}
  forge certs

${colors.bold("SUBCOMMANDS:")}
  list, ls            List the certificates of a site or of a domain
  get [id]            Get a certificate of a domain (the active one without an ID)
  create              Create a certificate for a domain (--type letsencrypt|existing|csr|clone)
  delete <id>         Delete a certificate of a domain
  activate <id>       Activate a certificate of a domain
  deactivate <id>     Deactivate a certificate of a domain

${colors.bold("OPTIONS:")}
  --server <id>       Server ID or name (required)
  --site <id>         Site ID or domain (required)
  --domain <id>       Domain record ID (required, except for list)
  -f, --format <fmt>  Output format: json, human, table

${colors.bold("NOTE:")}
  Each domain of a site has its certificates, and one of them is active.

Run ${colors.cyan("forge certificates <subcommand> --help")} for details.
`);
  }
}
