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

1. **CLI flags**: `--token <token>`, `--org <slug>`
2. **Environment variables**: `FORGE_API_TOKEN`, `FORGE_ORG`
3. **Config file** (XDG-compliant):

```bash
forge config set apiToken YOUR_FORGE_TOKEN
forge config set organizationSlug your-org-slug
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

| Command             | Alias   | Description                                          |
| ------------------- | ------- | ---------------------------------------------------- |
| `config`            |         | Manage CLI configuration (`set`, `get`, `delete`)    |
| `servers`           | `s`     | List, get, reboot servers                            |
| `sites`             |         | List, get sites; apply a site file                   |
| `deployments`       | `d`     | List deployments, trigger deploys, deploy script     |
| `databases`         | `db`    | List, get databases on a server                      |
| `database-users`    |         | List, get, create, delete database users on a server |
| `daemons`           |         | List, get, restart daemons on a server               |
| `backups`           |         | List, get, create, update, delete database backups   |
| `storage-providers` |         | List, get, create, delete backup storage providers   |
| `commands`          |         | List, get, create commands on a server               |
| `scheduled-jobs`    |         | List, get, create, delete scheduled jobs on a server |
| `monitors`          |         | List, get, create, delete monitors on a server       |
| `env`               |         | Get, update environment variables for a site         |
| `nginx`             |         | Get, update Nginx configuration for a site           |
| `nginx-templates`   |         | List, get, create, update, delete Nginx templates    |
| `php`               |         | PHP versions, config files, limits and OPcache       |
| `certificates`      | `certs` | List, get, activate SSL certificates for a site      |
| `firewall-rules`    | `fw`    | List, get firewall rules on a server                 |
| `ssh`               |         | Open an SSH session to a server                      |
| `ssh-keys`          |         | List, get, sync SSH keys on servers                  |
| `security-rules`    |         | List, get, create, delete security rules for a site  |
| `redirect-rules`    |         | List, get, create, delete redirect rules for a site  |
| `recipes`           |         | List, get, run recipes                               |
| `user`              |         | Get the authenticated user's profile                 |
| `completion`        |         | Install shell completion (bash, zsh, fish)           |

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
forge config set apiToken <token>              # Save API token
forge config set organizationSlug <slug>       # Save organization slug
forge config get                               # Show current config (masked)
forge config delete                            # Delete all stored config
```

### `servers` (`s`) — Manage servers

```bash
forge servers list                  # List all servers
forge servers get <id>              # Get server details
forge servers public-key <id>       # Print the public key of the forge user, for the git host
forge servers reboot <id>           # Reboot a server
forge servers create --name <name> --ip-address <ip> [--php-version php84 --database mariadb1011]
                                    # Create a server (Custom VPS by default)
```

### `sites` — Manage sites

```bash
forge sites list --server <id>              # List sites on a server
forge sites get <site_id> --server <id>     # Get site details
forge sites apply --file site.json --check  # Print the plan, change nothing
forge sites apply --file site.json          # Make the site match the file
```

#### Declare a site in a file with `sites apply`

`sites apply` makes a Forge site match a JSON file kept in the project, for example `config/forge/production/site.json`. Only `server` and `domain` are required. A key that is absent is not managed: `apply` does not read it, compare it or change it.

```json
{
  "$schema": "https://unpkg.com/@studiometa/forge-cli/schemas/site.schema.json",
  "server": "web-1",
  "domain": "example.com",
  "wwwRedirect": "to-www",
  "type": "php",
  "php": "php83",
  "webDirectory": "/public",
  "repository": {
    "provider": "custom",
    "url": "https://git.example.com/group/project.git",
    "branch": "main"
  },
  "database": { "name": "example", "user": "example" },
  "env": { "APP_ENV": "production" },
  "nginx": "nginx.conf",
  "workers": [{ "command": "php artisan queue:work database --queue=default", "processes": 4 }],
  "schedule": [{ "command": "php artisan schedule:run", "frequency": "minutely" }],
  "loadBalancer": { "server": "lb-1", "port": 80 }
}
```

| Key                                         | What `apply` does                                                                                                                                                                      |
| ------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `server`, `domain`                          | Find the server and the site by exact name (never a partial match, with or without `--exact`). `server` can also be an ID                                                              |
| `type`, `php`, `webDirectory`, `repository` | Create the site when it is missing (`type` is then required) and wait until Forge installs it. On an existing site, update `php`, `webDirectory` and the branch                        |
| `aliases`                                   | Add the missing aliases. Never remove one                                                                                                                                              |
| `wwwRedirect`                               | `to-www`, `from-www` or `none`. Create the site with this redirect. On an existing site, update the redirect of the primary domain when it differs. Aliases always get `none`          |
| `database`                                  | Create the database and the user when they are missing. A new user gets a random password, written only into the site `.env` (`DB_DATABASE`, `DB_USERNAME`, `DB_PASSWORD`, see below)  |
| `env`                                       | On a new site, write the whole `.env` (see below). On an existing site, add the missing keys. A key with another value on Forge is reported, never overwritten                         |
| `nginx`                                     | Nginx file, relative to the site file, with Forge template variables. Rendered for the site and written when it differs from Forge (see below)                                         |
| `workers`                                   | Forge background processes of the site. Create the missing ones, delete the ones of the site that the file does not declare. The directory defaults to the site root                   |
| `schedule`                                  | Forge scheduled jobs of the site (`minutely`, `hourly`, `nightly`, `weekly`, `monthly`, `reboot`, or `custom` with `cron`). A relative `artisan` becomes the absolute path of the site |
| `loadBalancer`                              | Set the nodes of the site on the load balancer to `server` only, on `port` (default `80`), with round robin and weight 1. The site of the load balancer must exist (see below)         |

A site that serves `www.example.com` is named by its apex domain, `"domain": "example.com"`, with `"wwwRedirect": "to-www"`: do not declare `www.example.com` as `domain` with `example.com` as an alias.

For an application that does not read the Laravel names, `database.env` maps the database name, the user and the password to other `.env` keys. Each key is optional and defaults to the Laravel name. Other values, such as the host, go in `env`:

```json
{
  "database": {
    "name": "example",
    "user": "example",
    "env": { "name": "DB_NAME", "user": "DB_USER", "password": "DB_PASSWD" }
  },
  "env": { "DB_SERVER": "127.0.0.1" }
}
```

When `apply` creates the site, the site file owns the whole `.env`: once Forge installs the site, `apply` writes a `.env` with the `env` keys and the generated database keys only. When Forge creates the site from a repository, it copies the `.env.example` of the repository into `.env`: `apply` drops these keys and values. The plan shows it as `+ write .env with these keys only (...)`. On an existing site, `apply` only adds the missing keys and never replaces a value. A site file with neither `env` nor `database` does not touch the `.env`.

`nginx` points to an Nginx file that uses the variables of [Forge Nginx templates](https://forge.laravel.com/docs/servers/nginx-templates). `apply` renders the file locally with the values of the site, so one file works on any server, without a template on the server:

| Variable                                        | Value                                                                                                    |
| ----------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| `{{SITE}}`, `{{SITE_ID}}`, `{{USER}}`           | Site name (`www.example.com`), site ID (`456`), site user (`forge`)                                      |
| `{{DOMAINS}}`                                   | Site name and aliases, separated by spaces                                                               |
| `{{ROOT_PATH}}`, `{{PATH}}`, `{{DIRECTORY}}`    | Site root, web directory (`/home/forge/www.example.com/public`) and its relative path (`/public`)        |
| `{{PROXY_PASS}}`                                | PHP-FPM socket, e.g. `unix:/var/run/php/php8.3-fpm.sock` (`php8.3-fpm-<user>.sock` for an isolated site) |
| `{{PORT}}`, `{{PORT_V6}}`                       | `80` and `[::]:80` (with `default_server` for the site named `default`)                                  |
| `{{SERVER_PUBLIC_IP}}`, `{{SERVER_PRIVATE_IP}}` | IP addresses of the server (empty when there is no private IP)                                           |

Spaces inside the braces are allowed (`{{ SITE_ID }}`). An unknown variable is an error (exit `3`). On a new site, `apply` writes the file after Forge installs the site. On an existing site, the plan shows the diff from Forge to the rendered file (CRLF and the final newline do not count), and `apply` writes it. When `apply` also changes the site or its aliases, it reads the site again and renders the file with the new values. Forge returns the full `server` block on old servers and only its content on recent ones: write the file in the same form as `forge nginx get` prints it.

Forge clones the repository when it creates the site, with the key of the `forge` user of the server. Add this key to the git host (for example as a deploy key) before `apply` creates the site:

```bash
forge servers public-key web-1 > server.pub   # The key only; --format json gives { "public_key": "..." }
```

A worker or a scheduled job matches the file when its command, directory, processes (or frequency) and user are the same. Commands are compared after normalization: quotes (`'database'` and `database`), repeated spaces and a relative `artisan` (`php artisan` and `php /home/forge/www.example.com/artisan`) do not count as differences. Forge cannot update a worker: a changed worker is created again, then the old one is deleted.

`workers` and `schedule` delete what the file does not declare, so `apply` deletes only what surely belongs to the site, because a server often hosts several sites:

- A scheduled job belongs to the site when Forge lists it on the site, or when its command uses the site path and no other site path.
- A worker belongs to the site when its directory is the site path or inside it. Without a directory, its command must use the site path and no other site path, and Forge must associate it with the site.
- Paths are compared on whole segments: `/home/forge/example.com` does not own `/home/forge/example.com-staging` or `/home/forge/example.com.old`.
- Workers and scheduled jobs that run as `root` are never deleted, and neither are the ones whose owner is not certain: they are reported as kept.
- Without the `workers` key, no worker is read or deleted. With `"workers": []`, all the workers of the site are deleted. The same applies to `schedule`.
- The site, its aliases, its database and its `.env` keys are never deleted. Only on a site that `apply` creates, the `.env` that Forge copies from `.env.example` is replaced.

`loadBalancer` sends the traffic of the load balancer to the server of the file. The site of the load balancer is the one named `domain` or one of the `aliases`. When no site matches, `--check` and `apply` exit `3` before any change. When two sites match, they exit `3` too. The Forge API cannot create a site on a load balancer: create it in Forge (New site on the load balancer), with its certificate. The DNS points to the load balancer, so a change of node needs no DNS change. To move a site to another server, do not only change `server`: `apply` would send the traffic to the new site at once, before its first deployment and without its data. Declare the new server in a second site file without `loadBalancer`, deploy and test it, then move `loadBalancer` to that file. Only one site file declares `loadBalancer` for a site: with the key in two files, each `apply` replaces the node of the other.

With `--check`, `apply` prints the plan and changes nothing. It exits `0` when Forge matches the file, `1` when it differs, and another code on an error (`3` for an invalid file). Every deletion shows its ID and full command. The plan gives `.env` key names only, never values, and shows a generated password as `<generated>`. With `--format json`, it prints `{ "inSync": false, "changes": [...], "warnings": [...] }`.

Run `--check` in merge request pipelines and `apply` on the main branch:

```bash
forge sites apply --file config/forge/production/site.json --check
forge sites apply --file config/forge/production/site.json
```

### `deployments` (`d`) — Manage deployments

```bash
forge deployments list --server <id> --site <id>                          # List deployments
forge deployments deploy --server <id> --site <id>                        # Trigger a deployment
forge deployments deploy --server <id> --site <id> --script-file deploy.sh  # Upload the script, then deploy
forge deployments logs [id] --server <id> --site <id>                     # Show deployment output (latest if no id)
forge deployments script --server <id> --site <id>                        # Print the deployment script
forge deployments update-script --server <id> --site <id> --file deploy.sh  # Update the script from a file
forge deployments update-script --server <id> --site <id> --file -        # Update the script from stdin
forge deployments update-script --server <id> --site <id> --content "..." # Update the script from a string
forge deployments update-script --server <id> --site <id> --file deploy.sh --check  # Compare only, do not write
```

The `deploy` command waits for deployment to complete, showing live progress. On completion it prints the deployment log and elapsed time.

Keep the deployment script in your repository: `update-script` takes exactly one of `--file` or `--content` and rejects an empty script. With `deploy --script-file`, the script is uploaded first; if the upload fails, the deployment does not start and the command exits non-zero.

#### Detect drift in CI with `--check`

`--check` on `deployments update-script`, `env update`, `nginx update` and `php update-config` compares your local file with the content on Forge and does not write anything. Line endings (CRLF and LF) and a single trailing newline are ignored.

- In sync: prints "in sync" and exits `0`.
- Different: prints a unified line diff (`-` remote, `+` local) and exits `1`.
- With `--format json`: prints `{ "inSync": true }` or `{ "inSync": false, "diff": "..." }`.

Run it in a pipeline to fail the job when someone changed the deployment script in the Forge UI:

```bash
forge deployments update-script --server 123 --site 456 --file deploy.sh --check
```

For `env update --check`, the comparison uses variables, not text: comments, blank lines and order are ignored. The output gives only variable names (added, removed, changed) and never values, in human and json formats (`{ "inSync": false, "diff": { "added": [], "removed": [], "changed": [] } }`), because CI logs are often visible to the whole team.

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
forge env update --server <id> --site <id> --file .env              # Update .env from a file
forge env update --server <id> --site <id> --file -                 # Update .env from stdin
forge env update --server <id> --site <id> --content "KEY=value"    # Update .env from a string
forge env update --server <id> --site <id> --file .env --check      # Compare variable names only, do not write
```

`update` takes exactly one of `--file` or `--content` and rejects empty content. Prefer `--file`: a value given with `--content` stays in your shell history.

### `nginx` — Manage Nginx configuration

```bash
forge nginx get --server <id> --site <id>                               # Get Nginx config
forge nginx update --server <id> --site <id> --file nginx.conf          # Update Nginx config from a file
forge nginx update --server <id> --site <id> --file -                   # Update Nginx config from stdin
forge nginx update --server <id> --site <id> --content "server { ... }" # Update Nginx config from a string
forge nginx update --server <id> --site <id> --file nginx.conf --check  # Compare only, do not write
```

`update` takes exactly one of `--file` or `--content` and rejects empty content.

### `php` — Manage PHP

```bash
forge php list --server <id>                                                        # List installed PHP versions
forge php config --server <id> --version 8.3 --type fpm                             # Print the FPM php.ini
forge php config --server <id> --version 8.3 --type pool --user forge               # Print the FPM pool config
forge php update-config --server <id> --version 8.3 --type cli --file php.ini       # Replace the CLI php.ini from a file
forge php update-config --server <id> --version 8.3 --type fpm --file -             # Replace the FPM php.ini from stdin
forge php update-config --server <id> --version 8.3 --type fpm --file php.ini --check  # Compare only, do not write
forge php max-upload-size --server <id>                                             # Print the max upload size (MB)
forge php set-max-upload-size 128 --server <id>                                     # Set the max upload size (MB)
forge php max-execution-time --server <id>                                          # Print the max execution time (seconds)
forge php set-max-execution-time 120 --server <id>                                  # Set the max execution time (seconds)
forge php opcache --server <id>                                                     # Print the OPcache status
forge php enable-opcache --server <id>                                              # Enable OPcache
forge php disable-opcache --server <id>                                             # Disable OPcache
```

`--version` takes a PHP version ID from `forge php list`, or a version such as `8.3`, `php83` or `php8.3`. `--type` is `cli` (CLI php.ini), `fpm` (FPM php.ini) or `pool` (FPM pool); `--user` applies to `pool` only. `update-config` replaces the whole file, takes exactly one of `--file` or `--content`, rejects empty content and supports `--check` (see [Detect drift in CI with `--check`](#detect-drift-in-ci-with---check)).

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

### `ssh` — Open an SSH session to a server

```bash
forge ssh <server>                              # Interactive session (forge@<ip>)
forge ssh <server> --user deploy                # Connect as a custom user
forge ssh <server> --private                    # Connect over the private IP
forge ssh <server> --port 2222                  # Override the SSH port
forge ssh <server> uptime                       # Run a remote command, then exit
forge ssh <server> --dry-run                    # Print the ssh command instead
```

Requires your local SSH key to be authorized on the server; this command launches `ssh`, it does not upload keys.

### `ssh-keys` — Manage SSH keys

```bash
forge ssh-keys list --server <id>               # List SSH keys
forge ssh-keys get <key_id> --server <id>       # Get SSH key details
forge ssh-keys sync --file keys --server <id> --dry-run     # Show what sync would change
forge ssh-keys sync --file keys --server 1,2 --server web-3 # Add the missing keys
forge ssh-keys sync --file keys --all-servers --prune       # Also remove keys not in the file
forge ssh-keys sync --file - --server <id> --user deploy    # Read the keys from stdin, for user deploy
```

`sync` makes the SSH keys of a server user (`--user`, default `forge`) match a file in `authorized_keys` format: one `<type> <base64> [comment]` per line, blank lines and `#` comments ignored. A malformed line stops the command with its line number. Each key gets the name `<comment slug>-<first 8 hex chars of the SHA-256 of the key>`. The Forge API does not return public keys, so keys are matched by name, and a changed key gets a new name. The command prints the plan per server (`+` add, `-` remove, `=` unchanged), applies it, then prints the result. It only adds keys, unless you give `--prune`; `--dry-run` changes nothing. Servers run one after the other. When an operation fails, the other operations still run and the command exits non-zero. When an add fails on a server, the removals on that server are skipped, so nobody loses access. `--format json` prints one document, `{ dry_run, servers: [{ id, name, added, removed, unchanged, errors }] }`. With `--dry-run`, `dry_run` is `true` and `added` and `removed` hold the planned changes.

### `scheduled-jobs` — Manage scheduled jobs (cron)

```bash
forge scheduled-jobs list --server <id>                                       # List scheduled jobs
forge scheduled-jobs get <job_id> --server <id>                               # Get scheduled job details
forge scheduled-jobs create --server <id> --command "..." --frequency hourly  # Create a job with a preset frequency
forge scheduled-jobs create --server <id> --command "..." --cron "0 3 * * *"  # Create a job with a cron expression
forge scheduled-jobs delete <job_id> --server <id>                            # Delete a scheduled job
```

`create` takes `--user` (default `forge`), `--frequency` (`minutely`, `hourly`, `nightly`, `weekly`, `monthly`, `reboot` or `custom`, default `custom`) and `--cron`, which Forge uses only when the frequency is `custom`. Add `--site <id>` to create the job on a site.

### `storage-providers` — Manage backup storage providers

```bash
forge storage-providers list                                # List storage providers
forge storage-providers list --provider custom              # Only one provider type
forge storage-providers get <id>                            # Get storage provider details
forge storage-providers delete <id>                         # Delete an unused storage provider

# Create a custom S3-compatible provider; the secret key comes from stdin
printf '%s' "$S3_SECRET_KEY" | forge storage-providers create \
  --name Backups --provider custom \
  --endpoint https://s3.example.com --region eu-west-1 --bucket my-bucket \
  --access-key "$S3_ACCESS_KEY" --secret-key-file - --format json
```

`--provider` is one of `s3`, `spaces`, `hetzner`, `ovh`, `scaleway` or `custom`. The secret key is read only from `--secret-key-file <path>` or `--secret-key-file -` (stdin), so it does not show in the shell history or the process list; one trailing newline is removed. `--assume-role` uses the EC2 instance role instead of keys. Forge never returns the keys. `--format json` prints the created provider with its `id`.

### `backups` — Manage database backups

```bash
forge backups list --server <id>                            # List backup configurations
forge backups get <id> --server <id>                        # Get backup configuration details
forge backups delete <id> --server <id>                     # Delete a backup configuration

# Back up two databases every day at 02:00 into web-1/, keep 7 backups
forge backups create --server web-1 --storage-provider Backups \
  --frequency daily --time 02:00 --retention 7 \
  --directory web-1 --databases app,wordpress
```

`--storage-provider` takes a storage provider ID or exact name and `--databases` takes database IDs or exact names, comma separated or repeated. `--frequency` is `hourly`, `daily`, `weekly` (with `--day 0` to `6`, 0 is Sunday) or `custom` (with `--cron`). `--time` is on the hour or half hour. `--retention` defaults to 5. Other options: `--bucket` (defaults to the provider bucket), `--name`, `--notification-email` and `--include-new-databases`. `forge backups update <id>` takes the same options and requires `--retention`.

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

All write operations (`deploy`, `create`, `delete`, `reboot`, `restart`, `update`, `run`, `activate`) are automatically logged to `~/.config/forge-tools/audit.log`. Override the path with the `FORGE_AUDIT_LOG` environment variable. Sensitive fields (tokens, passwords, storage provider keys) are redacted.

## Global Options

| Option            | Alias | Description                                      |
| ----------------- | ----- | ------------------------------------------------ |
| `--token <token>` |       | Forge API token (overrides config and env)       |
| `--org <slug>`    |       | Organization slug (overrides config and env)     |
| `--server <id>`   |       | Server ID or name (auto-resolved if non-numeric) |
| `--site <id>`     |       | Site ID or domain (auto-resolved if non-numeric) |
| `--exact`         |       | Match `--server` and `--site` names exactly      |
| `--format <fmt>`  | `-f`  | Output format: `json`, `human`, `table`          |
| `--no-color`      |       | Disable colored output                           |
| `--help`          | `-h`  | Show help                                        |
| `--version`       | `-v`  | Show version                                     |

### Exact name matching

`--server` and `--site` accept a numeric ID or a name. A name resolves to the server or site with that exact name first, then to a single partial match: `--site example.com` resolves to `shop.example.com` when no site is named `example.com`.

In CI and scripts, turn on exact matching with the `--exact` flag or the `FORGE_EXACT_MATCH=1` environment variable. A name must then match exactly (case-insensitive); otherwise the command fails and lists the near matches.

```bash
FORGE_EXACT_MATCH=1 forge deployments deploy --server 123 --site example.com
forge deployments deploy --server 123 --site example.com --exact
```

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
