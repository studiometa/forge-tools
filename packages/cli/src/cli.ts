#!/usr/bin/env node

import { handleBackupsCommand, showBackupsHelp } from "./commands/backups/index.ts";
import { handleCertificatesCommand, showCertificatesHelp } from "./commands/certificates/index.ts";
import { handleCommandsCommand, showCommandsHelp } from "./commands/commands/index.ts";
import { handleConfigCommand, showConfigHelp } from "./commands/config.ts";
import { handleDaemonsCommand, showDaemonsHelp } from "./commands/daemons/index.ts";
import { handleDatabasesCommand, showDatabasesHelp } from "./commands/databases/index.ts";
import {
  handleDatabaseUsersCommand,
  showDatabaseUsersHelp,
} from "./commands/database-users/index.ts";
import { handleDeploymentsCommand, showDeploymentsHelp } from "./commands/deployments/index.ts";
import { handleEnvCommand, showEnvHelp } from "./commands/env/index.ts";
import {
  handleFirewallRulesCommand,
  showFirewallRulesHelp,
} from "./commands/firewall-rules/index.ts";
import { handleMonitorsCommand, showMonitorsHelp } from "./commands/monitors/index.ts";
import { handleNginxCommand, showNginxHelp } from "./commands/nginx/index.ts";
import {
  handleNginxTemplatesCommand,
  showNginxTemplatesHelp,
} from "./commands/nginx-templates/index.ts";
import { handleRecipesCommand, showRecipesHelp } from "./commands/recipes/index.ts";
import {
  handleRedirectRulesCommand,
  showRedirectRulesHelp,
} from "./commands/redirect-rules/index.ts";
import {
  handleScheduledJobsCommand,
  showScheduledJobsHelp,
} from "./commands/scheduled-jobs/index.ts";
import {
  handleSecurityRulesCommand,
  showSecurityRulesHelp,
} from "./commands/security-rules/index.ts";
import { handleServersCommand, showServersHelp } from "./commands/servers/index.ts";
import { handleSitesCommand, showSitesHelp } from "./commands/sites/index.ts";
import { handleSshKeysCommand, showSshKeysHelp } from "./commands/ssh-keys/index.ts";
import { handleUserCommand, showUserHelp } from "./commands/user/index.ts";
import { colors, setColorEnabled } from "./utils/colors.ts";
import { parseArgs } from "./utils/args.ts";

declare const __VERSION__: string;
const VERSION = __VERSION__;

function showHelp(): void {
  console.log(`
${colors.bold("forge-cli")} v${VERSION}

${colors.bold("USAGE:")}
  forge-cli <command> [subcommand] [options]

${colors.bold("COMMANDS:")}
  config              Manage CLI configuration
    set <token>         Save API token
    get                 Show current token (masked)
    delete              Delete stored token

  servers, s          Manage servers
    list, ls            List all servers
    get <id>            Get server details
    reboot <id>         Reboot a server

  sites               Manage sites
    list, ls            List sites (requires --server)
    get <id>            Get site details (requires --server)

  deployments, d      Manage deployments
    list, ls            List deployments (requires --server --site)
    deploy              Trigger a deployment (requires --server --site)

  databases, db       Manage databases
    list, ls            List databases (requires --server)
    get <id>            Get database details (requires --server)

  database-users      Manage database users
    list, ls            List database users (requires --server)
    get <id>            Get database user details (requires --server)
    create              Create a database user (requires --server --name --password)
    delete <id>         Delete a database user (requires --server)

  daemons             Manage daemons
    list, ls            List daemons (requires --server)
    get <id>            Get daemon details (requires --server)
    restart <id>        Restart a daemon (requires --server)

  env                 Manage environment variables
    get                 Get env variables (requires --server --site)
    update              Update env variables (requires --server --site --content)

  nginx               Manage nginx configuration
    get                 Get nginx config (requires --server --site)
    update              Update nginx config (requires --server --site --content)

  certificates, certs Manage SSL certificates
    list, ls            List certificates (requires --server --site)
    get <id>            Get certificate details (requires --server --site)
    activate <id>       Activate a certificate (requires --server --site)

  firewall-rules, fw  Manage firewall rules
    list, ls            List firewall rules (requires --server)
    get <id>            Get firewall rule details (requires --server)

  ssh-keys            Manage SSH keys
    list, ls            List SSH keys (requires --server)
    get <id>            Get SSH key details (requires --server)

  backups             Manage backup configurations
    list, ls            List backup configurations (requires --server)
    get <id>            Get backup configuration details (requires --server)
    create              Create a backup configuration (requires --server --provider --frequency)
    delete <id>         Delete a backup configuration (requires --server)

  commands            Manage site commands
    list, ls            List commands (requires --server --site)
    get <id>            Get command details (requires --server --site)
    create              Execute a command (requires --server --site --command)

  scheduled-jobs      Manage scheduled jobs (cron)
    list, ls            List scheduled jobs (requires --server)
    get <id>            Get scheduled job details (requires --server)
    create              Create a scheduled job (requires --server --command)
    delete <id>         Delete a scheduled job (requires --server)

  user                Display authenticated user profile
    get                 Get the authenticated user profile

  monitors            Manage server monitors
    list, ls            List monitors (requires --server)
    get <id>            Get monitor details (requires --server)
    create              Create a monitor (requires --server --type --operator --threshold --minutes)
    delete <id>         Delete a monitor (requires --server)

  nginx-templates     Manage Nginx templates
    list, ls            List Nginx templates (requires --server)
    get <id>            Get Nginx template details (requires --server)
    create              Create a Nginx template (requires --server --name --content)
    update <id>         Update a Nginx template (requires --server)
    delete <id>         Delete a Nginx template (requires --server)

  security-rules      Manage site security rules
    list, ls            List security rules (requires --server --site)
    get <id>            Get security rule details (requires --server --site)
    create              Create a security rule (requires --server --site --name)
    delete <id>         Delete a security rule (requires --server --site)

  redirect-rules      Manage site redirect rules
    list, ls            List redirect rules (requires --server --site)
    get <id>            Get redirect rule details (requires --server --site)
    create              Create a redirect rule (requires --server --site --from --to)
    delete <id>         Delete a redirect rule (requires --server --site)

  recipes             Manage recipes
    list, ls            List all recipes
    get <id>            Get recipe details
    run <id>            Run a recipe (requires --servers)

${colors.bold("OPTIONS:")}
  --token <token>     Forge API token (overrides config and env)
  --server <id>       Server ID (required for server-scoped commands)
  --site <id>         Site ID (required for site-scoped commands)
  -f, --format <fmt>  Output format: json, human, table (default: human)
  --no-color          Disable colored output
  -h, --help          Show help
  -v, --version       Show version

${colors.bold("EXAMPLES:")}
  # Configure API token
  forge-cli config set YOUR_TOKEN

  # Or pass token directly
  forge-cli servers list --token YOUR_TOKEN

  # List all servers
  forge-cli servers list

  # List sites on a server
  forge-cli sites list --server 123

  # Deploy a site
  forge-cli deployments deploy --server 123 --site 456

  # Get JSON output (for AI agents)
  forge-cli servers list --format json

${colors.bold("CREDENTIAL PRIORITY:")}
  1. CLI argument (--token)
  2. Environment variable (FORGE_API_TOKEN)
  3. Config file (~/.config/forge-tools/config.json)

${colors.bold("ENVIRONMENT VARIABLES:")}
  FORGE_API_TOKEN    API token
  NO_COLOR           Disable colors
  XDG_CONFIG_HOME    Config directory (respects XDG spec)
`);
}

async function main(): Promise<void> {
  const { command, options, positional } = parseArgs();

  const [mainCommand, subcommand] = command;
  const wantsHelp = options.help !== undefined || options.h !== undefined;

  if (wantsHelp && !mainCommand) {
    showHelp();
    process.exit(0);
  }

  if (options.version || options.v) {
    console.log(VERSION);
    process.exit(0);
  }

  if (options["no-color"]) {
    setColorEnabled(false);
  }

  if (!mainCommand) {
    showHelp();
    process.exit(0);
  }

  try {
    switch (mainCommand) {
      case "config":
        if (wantsHelp) {
          showConfigHelp();
          process.exit(0);
        }
        handleConfigCommand(
          subcommand ?? "get",
          positional,
          options as Record<string, string | boolean | string[]>,
        );
        break;

      case "servers":
      case "s":
        if (wantsHelp) {
          showServersHelp(subcommand);
          process.exit(0);
        }
        await handleServersCommand(
          subcommand ?? "list",
          positional,
          options as Record<string, string | boolean | string[]>,
        );
        break;

      case "sites":
        if (wantsHelp) {
          showSitesHelp(subcommand);
          process.exit(0);
        }
        await handleSitesCommand(
          subcommand ?? "list",
          positional,
          options as Record<string, string | boolean | string[]>,
        );
        break;

      case "deployments":
      case "d":
        if (wantsHelp) {
          showDeploymentsHelp(subcommand);
          process.exit(0);
        }
        await handleDeploymentsCommand(
          subcommand ?? "list",
          positional,
          options as Record<string, string | boolean | string[]>,
        );
        break;

      case "databases":
      case "db":
        if (wantsHelp) {
          showDatabasesHelp(subcommand);
          process.exit(0);
        }
        await handleDatabasesCommand(
          subcommand ?? "list",
          positional,
          options as Record<string, string | boolean | string[]>,
        );
        break;

      case "database-users":
        if (wantsHelp) {
          showDatabaseUsersHelp(subcommand);
          process.exit(0);
        }
        await handleDatabaseUsersCommand(
          subcommand ?? "list",
          positional,
          options as Record<string, string | boolean | string[]>,
        );
        break;

      case "daemons":
        if (wantsHelp) {
          showDaemonsHelp(subcommand);
          process.exit(0);
        }
        await handleDaemonsCommand(
          subcommand ?? "list",
          positional,
          options as Record<string, string | boolean | string[]>,
        );
        break;

      case "env":
        if (wantsHelp) {
          showEnvHelp(subcommand);
          process.exit(0);
        }
        await handleEnvCommand(
          subcommand ?? "get",
          positional,
          options as Record<string, string | boolean | string[]>,
        );
        break;

      case "nginx":
        if (wantsHelp) {
          showNginxHelp(subcommand);
          process.exit(0);
        }
        await handleNginxCommand(
          subcommand ?? "get",
          positional,
          options as Record<string, string | boolean | string[]>,
        );
        break;

      case "certificates":
      case "certs":
        if (wantsHelp) {
          showCertificatesHelp(subcommand);
          process.exit(0);
        }
        await handleCertificatesCommand(
          subcommand ?? "list",
          positional,
          options as Record<string, string | boolean | string[]>,
        );
        break;

      case "firewall-rules":
      case "fw":
        if (wantsHelp) {
          showFirewallRulesHelp(subcommand);
          process.exit(0);
        }
        await handleFirewallRulesCommand(
          subcommand ?? "list",
          positional,
          options as Record<string, string | boolean | string[]>,
        );
        break;

      case "ssh-keys":
        if (wantsHelp) {
          showSshKeysHelp(subcommand);
          process.exit(0);
        }
        await handleSshKeysCommand(
          subcommand ?? "list",
          positional,
          options as Record<string, string | boolean | string[]>,
        );
        break;

      case "backups":
        if (wantsHelp) {
          showBackupsHelp(subcommand);
          process.exit(0);
        }
        await handleBackupsCommand(
          subcommand ?? "list",
          positional,
          options as Record<string, string | boolean | string[]>,
        );
        break;

      case "commands":
        if (wantsHelp) {
          showCommandsHelp(subcommand);
          process.exit(0);
        }
        await handleCommandsCommand(
          subcommand ?? "list",
          positional,
          options as Record<string, string | boolean | string[]>,
        );
        break;

      case "scheduled-jobs":
        if (wantsHelp) {
          showScheduledJobsHelp(subcommand);
          process.exit(0);
        }
        await handleScheduledJobsCommand(
          subcommand ?? "list",
          positional,
          options as Record<string, string | boolean | string[]>,
        );
        break;

      case "user":
        if (wantsHelp) {
          showUserHelp(subcommand);
          process.exit(0);
        }
        await handleUserCommand(
          subcommand ?? "get",
          positional,
          options as Record<string, string | boolean | string[]>,
        );
        break;

      case "monitors":
        if (wantsHelp) {
          showMonitorsHelp(subcommand);
          process.exit(0);
        }
        await handleMonitorsCommand(
          subcommand ?? "list",
          positional,
          options as Record<string, string | boolean | string[]>,
        );
        break;

      case "nginx-templates":
        if (wantsHelp) {
          showNginxTemplatesHelp(subcommand);
          process.exit(0);
        }
        await handleNginxTemplatesCommand(
          subcommand ?? "list",
          positional,
          options as Record<string, string | boolean | string[]>,
        );
        break;

      case "security-rules":
        if (wantsHelp) {
          showSecurityRulesHelp(subcommand);
          process.exit(0);
        }
        await handleSecurityRulesCommand(
          subcommand ?? "list",
          positional,
          options as Record<string, string | boolean | string[]>,
        );
        break;

      case "redirect-rules":
        if (wantsHelp) {
          showRedirectRulesHelp(subcommand);
          process.exit(0);
        }
        await handleRedirectRulesCommand(
          subcommand ?? "list",
          positional,
          options as Record<string, string | boolean | string[]>,
        );
        break;

      case "recipes":
        if (wantsHelp) {
          showRecipesHelp(subcommand);
          process.exit(0);
        }
        await handleRecipesCommand(
          subcommand ?? "list",
          positional,
          options as Record<string, string | boolean | string[]>,
        );
        break;

      default:
        console.error(colors.red(`Unknown command: ${mainCommand}`));
        console.log(`Run ${colors.cyan("forge-cli --help")} for usage information`);
        process.exit(1);
    }
  } catch (error) {
    console.error(colors.red("Fatal error:"), error);
    process.exit(1);
  }
}

main().catch((error) => {
  console.error(colors.red("Unhandled error:"), error);
  process.exit(1);
});
