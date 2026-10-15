import { colors } from "../../utils/colors.ts";

export function showNginxHelp(subcommand?: string): void {
  if (subcommand === "get") {
    console.log(`
${colors.bold("forge nginx get")} - Get nginx configuration

${colors.bold("USAGE:")}
  forge nginx get --server <server_id> --site <site_id>
  forge nginx get --server <server_id> --site <site_id> --domain <domain>

${colors.bold("OPTIONS:")}
  --server <id>       Server ID or name (required)
  --site <id>         Site ID or name (required)
  --domain <domain>   Domain record ID or name (e.g. www.example.com).
                      Get the configuration of this domain instead of the site.
                      A name needs the site:meta token scope; an ID does not.

${colors.bold("EXAMPLES:")}
  forge nginx get --server 123 --site 456
  forge nginx get --server 123 --site example.com --domain www.example.com
`);
  } else if (subcommand === "update") {
    console.log(`
${colors.bold("forge nginx update")} - Update nginx configuration

${colors.bold("USAGE:")}
  forge nginx update --server <server_id> --site <site_id> --file <path>
  forge nginx update --server <server_id> --site <site_id> --file <path> --check
  forge nginx update --server <server_id> --site <site_id> --content <nginx_config>
  forge nginx update --server <server_id> --site <site_id> --domain <domain> --file <path>

${colors.bold("OPTIONS:")}
  --server <id>       Server ID or name (required)
  --site <id>         Site ID or name (required)
  --domain <domain>   Domain record ID or name (e.g. www.example.com).
                      Update the configuration of this domain instead of the site.
                      A name needs the site:meta token scope; an ID does not.
  --file <path>       Read the content from a file (use - for stdin)
  --content <str>     New nginx config
  --check             Compare with the content on Forge and do not write.
                      Exit 0 when in sync, 1 with a line diff (- remote, + local).
  -f, --format <fmt>  Output format: json ({ inSync, diff? } with --check), human

  Give exactly one of --file or --content. Empty content is rejected.

${colors.bold("EXAMPLES:")}
  forge nginx update --server 123 --site 456 --file nginx.conf
  cat nginx.conf | forge nginx update --server 123 --site 456 --file -
  forge nginx update --server 123 --site 456 --file nginx.conf --check
  forge nginx update --server 123 --site 456 --domain www.example.com --file www.conf
`);
  } else {
    console.log(`
${colors.bold("forge nginx")} - Manage nginx configuration of a site or of one of its domains

${colors.bold("USAGE:")}
  forge nginx <subcommand> [options]

${colors.bold("SUBCOMMANDS:")}
  get                 Get nginx configuration
  update              Update nginx configuration

${colors.bold("OPTIONS:")}
  --server <id>       Server ID or name (required)
  --site <id>         Site ID or name (required)
  --domain <domain>   Domain record ID or name: target this domain instead of the site
                      (a name needs the site:meta token scope; an ID does not)
  --file <path>       Content file, - for stdin (for update)
  --content <str>     New nginx config (for update)
  --check             Compare with Forge, do not write (for update)

Run ${colors.cyan("forge nginx <subcommand> --help")} for details.
`);
  }
}
