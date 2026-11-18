import { colors } from "../../utils/colors.ts";

export function showLoadBalancerHelp(subcommand?: string): void {
  if (subcommand === "apply") {
    console.log(`
${colors.bold("forge load-balancer apply")} - Make the site of a load balancer match a load balancer file

${colors.bold("USAGE:")}
  forge load-balancer apply --file <load-balancer.json> [--check] [--force] [options]

${colors.bold("OPTIONS:")}
  --file <path>       Load balancer file (required), e.g. config/forge/load-balancer.json
  --check             Print the plan and change nothing: exit 0 when Forge matches,
                      exit 1 when it differs, another code on error
  --force             Replace the nodes and set the method even when the nodes match.
                      Needed to change only the method. Forge reloads Nginx on the
                      load balancer: do not use it in every pipeline
  -f, --format <fmt>  Output format: json, human

${colors.bold("LOAD BALANCER FILE:")}
    server                                Load balancer name (exact match) or ID
    method                                round_robin (default), least_conn or ip_hash
    nodes [{ environment, port, weight, backup, down }]
                                          One node per environment: the site file
                                          <environment>/site.json, next to the load
                                          balancer file, gives its server and domain.
                                          Defaults: port 80, weight 1, backup and down false

  The site files of the nodes must declare the same domain, aliases, wildcards and
  wwwRedirect (the www redirect of the primary domain of the load balancer site),
  and each site must exist on its server: run forge sites apply first.
  apply creates the site of the load balancer when no site has the domain or an alias
  as its name, replaces its nodes when they differ and adds the missing aliases.
  It never deletes the site or an alias. Forge does not report the method: apply sets
  it with the nodes, and a different method alone is not a change (use --force).

${colors.bold("EXAMPLES:")}
  forge load-balancer apply --file config/forge/load-balancer.json --check
  forge load-balancer apply --file config/forge/load-balancer.json
  forge load-balancer apply --file config/forge/load-balancer.json --force
`);
  } else {
    console.log(`
${colors.bold("forge load-balancer")} - Manage the site of a load balancer

${colors.bold("USAGE:")}
  forge load-balancer <subcommand> [options]

${colors.bold("SUBCOMMANDS:")}
  apply               Make the site of a load balancer match a file (--file, --check, --force)

${colors.bold("OPTIONS:")}
  -f, --format <fmt>  Output format: json, human
  -h, --help          Show help for a subcommand

${colors.bold("EXAMPLES:")}
  forge load-balancer apply --file config/forge/load-balancer.json --check

Run ${colors.cyan("forge load-balancer <subcommand> --help")} for subcommand details.
`);
  }
}
