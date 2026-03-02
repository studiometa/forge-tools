# @studiometa/forge-cli

[![npm version](https://img.shields.io/npm/v/@studiometa/forge-cli?style=flat&colorB=3e63dd&colorA=414853)](https://www.npmjs.com/package/@studiometa/forge-cli)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat&colorB=3e63dd&colorA=414853)](https://opensource.org/licenses/MIT)

CLI tool for managing Laravel Forge servers, sites, and deployments. Optimized for both AI agents and human users.

## Installation

```bash
npm install -g @studiometa/forge-cli

# Or use directly with npx
npx @studiometa/forge-cli --help
```

## Configuration

Credentials can be provided in three ways (highest priority first):

1. **CLI argument**: `--token <token>`
2. **Environment variable**: `FORGE_API_TOKEN`
3. **Config file** (XDG-compliant):

```bash
forge config set YOUR_FORGE_TOKEN
forge config get
forge config delete
```

| Platform | Config path                                             |
| -------- | ------------------------------------------------------- |
| Linux    | `~/.config/forge-tools/config.json`                     |
| macOS    | `~/Library/Application Support/forge-tools/config.json` |
| Windows  | `%APPDATA%/forge-tools/config.json`                     |

## Commands

```
forge <command> [subcommand] [options]
```

| Command           | Alias   | Description                                          |
| ----------------- | ------- | ---------------------------------------------------- |
| `config`          |         | Manage CLI configuration (`set`, `get`, `delete`)    |
| `servers`         | `s`     | List, get, reboot servers                            |
| `sites`           |         | List, get sites on a server                          |
| `deployments`     | `d`     | List deployments, trigger deploys                    |
| `databases`       | `db`    | List, get databases on a server                      |
| `database-users`  |         | List, get, create, delete database users on a server |
| `daemons`         |         | List, get, restart daemons on a server               |
| `backups`         |         | List, get, create, delete backup configs on a server |
| `commands`        |         | List, get, create commands on a server               |
| `scheduled-jobs`  |         | List, get, create, delete scheduled jobs on a server |
| `monitors`        |         | List, get, create, delete monitors on a server       |
| `env`             |         | Get, update environment variables for a site         |
| `nginx`           |         | Get, update Nginx configuration for a site           |
| `nginx-templates` |         | List, get, create, update, delete Nginx templates    |
| `certificates`    | `certs` | List, get, activate SSL certificates for a site      |
| `firewall-rules`  | `fw`    | List, get firewall rules on a server                 |
| `ssh-keys`        |         | List, get SSH keys on a server                       |
| `security-rules`  |         | List, get, create, delete security rules for a site  |
| `redirect-rules`  |         | List, get, create, delete redirect rules for a site  |
| `recipes`         |         | List, get, run recipes                               |
| `user`            |         | Get the authenticated user's profile                 |
| `completion`      |         | Install shell completion (bash, zsh, fish)           |

Run `forge <command> --help` for detailed usage of each command.

## Quick Start

```bash
# Save your API token
forge config set YOUR_FORGE_TOKEN

# List all servers
forge servers list

# List sites on a server
forge sites list --server 123

# Deploy a site
forge deployments deploy --server 123 --site 456

# Get environment variables
forge env get --server 123 --site 456
```

## Output Formats

All list/get commands support `--format`:

| Format | Flag             | Description                          |
| ------ | ---------------- | ------------------------------------ |
| Human  | `--format human` | Colored, readable output (default)   |
| JSON   | `--format json`  | Structured JSON for programmatic use |
| Table  | `--format table` | ASCII table                          |

```bash
forge servers list --format json
forge sites list --server 123 --format table
```

## Command Reference

### `config` — Manage configuration

```bash
forge config set <token>   # Save API token to config file
forge config get           # Show current token (masked)
forge config delete        # Delete stored token
```

### `servers` (`s`) — Manage servers

```bash
forge servers list                  # List all servers
forge servers get <id>              # Get server details
forge servers reboot <id>           # Reboot a server
```

### `sites` — Manage sites

```bash
forge sites list --server <id>              # List sites on a server
forge sites get <site_id> --server <id>     # Get site details
```

### `deployments` (`d`) — Manage deployments

```bash
forge deployments list --server <id> --site <id>    # List deployments
forge deployments deploy --server <id> --site <id>  # Trigger a deployment
```

The `deploy` command waits for deployment to complete, showing live progress. On completion it prints the deployment log and elapsed time.

### `databases` (`db`) — Manage databases

```bash
forge databases list --server <id>              # List databases
forge databases get <db_id> --server <id>       # Get database details
```

### `daemons` — Manage background processes

```bash
forge daemons list --server <id>                    # List daemons
forge daemons get <daemon_id> --server <id>         # Get daemon details
forge daemons restart <daemon_id> --server <id>     # Restart a daemon
```

### `env` — Manage environment variables

```bash
forge env get --server <id> --site <id>                             # Get .env content
forge env update --server <id> --site <id> --content "KEY=value"    # Update .env
```

### `nginx` — Manage Nginx configuration

```bash
forge nginx get --server <id> --site <id>                               # Get Nginx config
forge nginx update --server <id> --site <id> --content "server { ... }" # Update Nginx config
```

### `certificates` (`certs`) — Manage SSL certificates

```bash
forge certificates list --server <id> --site <id>               # List certificates
forge certificates get <cert_id> --server <id> --site <id>      # Get certificate details
forge certificates activate <cert_id> --server <id> --site <id> # Activate a certificate
```

### `firewall-rules` (`fw`) — Manage firewall rules

```bash
forge firewall-rules list --server <id>                 # List firewall rules
forge firewall-rules get <rule_id> --server <id>        # Get rule details
```

### `ssh-keys` — Manage SSH keys

```bash
forge ssh-keys list --server <id>               # List SSH keys
forge ssh-keys get <key_id> --server <id>       # Get SSH key details
```

### `recipes` — Manage recipes

```bash
forge recipes list                                          # List all recipes
forge recipes get <id>                                      # Get recipe details
forge recipes run <id> --servers 123,456                    # Run recipe on servers
```

### `completion` — Shell completion

```bash
forge completion bash           # Install Bash completion
forge completion zsh            # Install Zsh completion
forge completion fish           # Install Fish completion
forge completion bash --print   # Print script without installing
```

## Audit Logging

All write operations (`deploy`, `create`, `delete`, `reboot`, `restart`, `update`, `run`, `activate`) are automatically logged to `~/.config/forge-tools/audit.log`. Override the path with the `FORGE_AUDIT_LOG` environment variable. Sensitive fields (tokens, passwords) are redacted.

## Global Options

| Option            | Alias | Description                                     |
| ----------------- | ----- | ----------------------------------------------- |
| `--token <token>` |       | Forge API token (overrides config and env)      |
| `--server <id>`   |       | Server ID (required for server-scoped commands) |
| `--site <id>`     |       | Site ID (required for site-scoped commands)     |
| `--format <fmt>`  | `-f`  | Output format: `json`, `human`, `table`         |
| `--no-color`      |       | Disable colored output                          |
| `--help`          | `-h`  | Show help                                       |
| `--version`       | `-v`  | Show version                                    |

## AI Agent Integration

The CLI is designed for programmatic use by AI agents:

- Structured JSON output with `--format json`
- Consistent error messages with non-zero exit codes
- Fully non-interactive and scriptable

```bash
# Get all servers as JSON
forge servers list --format json

# Deploy and capture output
forge deployments deploy --server 123 --site 456 --format json
```

## Requirements

- **Node.js 24+**
- **Laravel Forge account** with API token

## Getting Your API Token

1. Log into [Laravel Forge](https://forge.laravel.com)
2. Go to **Account → API Tokens**
3. Create a new token with the scopes you need
4. Copy the token (it's only shown once)

## License

MIT © [Studio Meta](https://www.studiometa.fr)
