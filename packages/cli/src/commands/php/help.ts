import { colors } from "../../utils/colors.ts";

export function showPhpHelp(subcommand?: string): void {
  if (subcommand === "list" || subcommand === "ls") {
    console.log(`
${colors.bold("forge php list")} - List the PHP versions installed on a server

${colors.bold("USAGE:")}
  forge php list --server <server_id>

${colors.bold("OPTIONS:")}
  --server <id>       Server ID or name (required)
  -f, --format <fmt>  Output format: json, human, table

${colors.bold("EXAMPLES:")}
  forge php list --server 123
`);
  } else if (subcommand === "config") {
    console.log(`
${colors.bold("forge php config")} - Print a PHP configuration file

${colors.bold("USAGE:")}
  forge php config --server <server_id> --version <version> --type <cli|fpm|pool>

${colors.bold("OPTIONS:")}
  --server <id>       Server ID or name (required)
  --version <ver>     PHP version ID, or a version such as 8.3, php83 or php8.3 (required)
  --type <type>       cli (CLI php.ini), fpm (FPM php.ini) or pool (FPM pool) (required)
  --user <name>       FPM pool user (pool only)
  -f, --format <fmt>  Output format: json ({ content }), human

${colors.bold("EXAMPLES:")}
  forge php config --server 123 --version 8.3 --type fpm
  forge php config --server 123 --version 8.3 --type pool > www.conf
`);
  } else if (subcommand === "update-config") {
    console.log(`
${colors.bold("forge php update-config")} - Replace a PHP configuration file

${colors.bold("USAGE:")}
  forge php update-config --server <server_id> --version <version> --type <cli|fpm|pool> --file <path>
  forge php update-config --server <server_id> --version <version> --type <cli|fpm|pool> --file <path> --check
  forge php update-config --server <server_id> --version <version> --type <cli|fpm|pool> --content <config>

${colors.bold("OPTIONS:")}
  --server <id>       Server ID or name (required)
  --version <ver>     PHP version ID, or a version such as 8.3, php83 or php8.3 (required)
  --type <type>       cli (CLI php.ini), fpm (FPM php.ini) or pool (FPM pool) (required)
  --user <name>       FPM pool user (pool only)
  --file <path>       Read the content from a file (use - for stdin)
  --content <str>     New configuration file content
  --check             Compare with the content on Forge and do not write.
                      Exit 0 when in sync, 1 with a line diff (- remote, + local).
  -f, --format <fmt>  Output format: json ({ inSync, diff? } with --check), human

  Give exactly one of --file or --content. Empty content is rejected.
  The content replaces the whole file.

${colors.bold("EXAMPLES:")}
  forge php update-config --server 123 --version 8.3 --type fpm --file php.ini
  cat php.ini | forge php update-config --server 123 --version 8.3 --type cli --file -
  forge php update-config --server 123 --version 8.3 --type fpm --file php.ini --check
`);
  } else if (
    subcommand === "max-upload-size" ||
    subcommand === "set-max-upload-size" ||
    subcommand === "max-execution-time" ||
    subcommand === "set-max-execution-time"
  ) {
    console.log(`
${colors.bold("forge php max-upload-size / max-execution-time")} - Get or set PHP limits

${colors.bold("USAGE:")}
  forge php max-upload-size --server <server_id>
  forge php set-max-upload-size <megabytes> --server <server_id>
  forge php max-execution-time --server <server_id>
  forge php set-max-execution-time <seconds> --server <server_id>

${colors.bold("OPTIONS:")}
  --server <id>       Server ID or name (required)
  -f, --format <fmt>  Output format: json, human

${colors.bold("EXAMPLES:")}
  forge php set-max-upload-size 128 --server 123
  forge php set-max-execution-time 120 --server 123
`);
  } else if (
    subcommand === "opcache" ||
    subcommand === "enable-opcache" ||
    subcommand === "disable-opcache"
  ) {
    console.log(`
${colors.bold("forge php opcache")} - Get, enable or disable OPcache

${colors.bold("USAGE:")}
  forge php opcache --server <server_id>
  forge php enable-opcache --server <server_id>
  forge php disable-opcache --server <server_id>

${colors.bold("OPTIONS:")}
  --server <id>       Server ID or name (required)
  -f, --format <fmt>  Output format: json, human
`);
  } else {
    console.log(`
${colors.bold("forge php")} - Manage PHP on a server

${colors.bold("USAGE:")}
  forge php <subcommand> [options]

${colors.bold("SUBCOMMANDS:")}
  list, ls                         List installed PHP versions
  config                           Print a configuration file (--version --type)
  update-config                    Replace a configuration file (--version --type --file|--content) [--check]
  max-upload-size                  Print the max upload size (MB)
  set-max-upload-size <mb>         Set the max upload size (MB)
  max-execution-time               Print the max execution time (seconds)
  set-max-execution-time <sec>     Set the max execution time (seconds)
  opcache                          Print the OPcache status
  enable-opcache                   Enable OPcache
  disable-opcache                  Disable OPcache

${colors.bold("OPTIONS:")}
  --server <id>       Server ID or name (required)
  --version <ver>     PHP version ID or version (8.3, php83) (for config commands)
  --type <type>       cli, fpm or pool (for config commands)
  --user <name>       FPM pool user (for --type pool)
  --file <path>       Content file, - for stdin (for update-config)
  --content <str>     New content (for update-config)
  --check             Compare with Forge, do not write (for update-config)

Run ${colors.cyan("forge php <subcommand> --help")} for details.
`);
  }
}
