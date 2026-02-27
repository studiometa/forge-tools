---
name: forge-mcp
description: MCP server for Laravel Forge — manage servers, sites, deployments, SSL, databases, and more via AI agents
keywords:
  - forge
  - laravel
  - servers
  - deployment
  - devops
  - mcp
---

# Laravel Forge MCP Server

MCP (Model Context Protocol) server for [Laravel Forge](https://forge.laravel.com). Provides two tools: `forge` for read operations and `forge_write` for write operations.

## Quick Start

Before your first interaction with any resource, call `action="help"` with that resource to discover required fields and examples.

## Tools

### `forge` — Read Operations

Safe, read-only queries. Use for listing, getting details, resolving names, fetching context snapshots, help, and schema.

**Actions**: `list`, `get`, `resolve`, `context`, `help`, `schema`

```
forge(resource, action, [parameters...])
```

### `forge_write` — Write Operations

Mutating operations that modify server state. Always requires confirmation.

**Actions**: `create`, `update`, `delete`, `deploy`, `reboot`, `restart`, `activate`, `run`

```
forge_write(resource, action, [parameters...])
```

### Resources & Actions

| Resource          | Read Actions (`forge`)              | Write Actions (`forge_write`)  | Scope  |
| ----------------- | ----------------------------------- | ------------------------------ | ------ |
| `servers`         | `list`, `get`, `resolve`, `context` | `create`, `delete`, `reboot`   | global |
| `sites`           | `list`, `get`, `resolve`, `context` | `create`, `delete`             | server |
| `deployments`     | `list`                              | `deploy`, `update`             | site   |
| `env`             | `get`                               | `update`                       | site   |
| `nginx`           | `get`                               | `update`                       | site   |
| `certificates`    | `list`, `get`                       | `create`, `delete`, `activate` | site   |
| `databases`       | `list`, `get`                       | `create`, `delete`             | server |
| `database-users`  | `list`, `get`                       | `create`, `delete`             | server |
| `daemons`         | `list`, `get`                       | `create`, `delete`, `restart`  | server |
| `firewall-rules`  | `list`, `get`                       | `create`, `delete`             | server |
| `ssh-keys`        | `list`, `get`                       | `create`, `delete`             | server |
| `security-rules`  | `list`, `get`                       | `create`, `delete`             | site   |
| `redirect-rules`  | `list`, `get`                       | `create`, `delete`             | site   |
| `monitors`        | `list`, `get`                       | `create`, `delete`             | server |
| `nginx-templates` | `list`, `get`                       | `create`, `update`, `delete`   | server |
| `recipes`         | `list`, `get`                       | `create`, `delete`, `run`      | global |
| `scheduled-jobs`  | `list`, `get`                       | `create`, `delete`             | server |
| `backups`         | `list`, `get`                       | `create`, `delete`             | server |
| `commands`        | `list`, `get`                       | `create`                       | site   |
| `user`            | `get`                               | —                              | global |
| `batch`           | `run`                               | —                              | global |

### Scope Guide

- **global**: No parent ID needed (e.g. `servers`, `recipes`)
- **server**: Requires `server_id` (e.g. `sites`, `databases`, `daemons`)
- **site**: Requires `server_id` + `site_id` (e.g. `deployments`, `env`, `certificates`)

### Auto-Resolve: Names Instead of IDs

`server_id` and `site_id` accept **name strings** in addition to numeric IDs. When a non-numeric value is provided, the server automatically performs a case-insensitive partial match against known resources:

- **`server_id`**: Matched against server names (e.g. `"prod"` resolves `"production-web-01"`)
- **`site_id`**: Matched against site domains (e.g. `"myapp"` resolves `"myapp.example.com"`)

Resolution rules:

- **Exact single match** → resolved silently, the call proceeds normally
- **Ambiguous (multiple matches)** → error listing all candidates; use a more specific name or numeric ID
- **No match** → error with a hint to use `action: "resolve"` to search

This applies to **every** resource and action automatically — no special syntax needed.

Use `action: "resolve"` explicitly when you need to search or preview matches before acting:

```json
// Search servers by name
{ "resource": "servers", "action": "resolve", "query": "prod" }

// Search sites on a server by domain
{ "resource": "sites", "action": "resolve", "server_id": "123", "query": "myapp" }
```

### Getting Help

Use `action: "help"` to get detailed documentation for any resource:

```json
{ "resource": "servers", "action": "help" }
{ "resource": "deployments", "action": "help" }
```

Use `action: "schema"` for a compact machine-readable spec:

```json
{ "resource": "sites", "action": "schema" }
```

## Common Parameters

| Parameter    | Type    | Description                                                                                             |
| ------------ | ------- | ------------------------------------------------------------------------------------------------------- |
| `resource`   | string  | **Required**. Resource type (see table above)                                                           |
| `action`     | string  | **Required**. Action to perform                                                                         |
| `id`         | string  | Resource ID (for `get`, `delete`, `activate`, `restart`)                                                |
| `server_id`  | string  | Server ID **or name** — numeric IDs are used as-is; names are auto-resolved via partial match           |
| `site_id`    | string  | Site ID **or domain name** — auto-resolved via partial match; requires `server_id`                      |
| `query`      | string  | Search query for `resolve` action (partial, case-insensitive match against resource names/domains)      |
| `compact`    | boolean | Compact output (default: true)                                                                          |
| `content`    | string  | Content for env/nginx `update` and deployment script `update`                                           |
| `operations` | array   | Array of operations for `batch` `run` (max 10). Each item needs `resource`, `action`, and extra params. |

## Common Workflows

### Deploy a Site

```json
// 1. Find the server (forge tool — read)
{ "resource": "servers", "action": "list" }

// 2. Find the site (forge tool — read)
{ "resource": "sites", "action": "list", "server_id": "123" }

// 3. Deploy (forge_write tool — write, blocks until complete)
{ "resource": "deployments", "action": "deploy", "server_id": "123", "site_id": "456" }
// Returns: deployment status, log output, and elapsed time
```

### Check Server Status

```json
// Get server details (forge)
{ "resource": "servers", "action": "get", "id": "123" }

// List sites on server (forge)
{ "resource": "sites", "action": "list", "server_id": "123" }

// List databases (forge)
{ "resource": "databases", "action": "list", "server_id": "123" }

// List background processes (forge)
{ "resource": "daemons", "action": "list", "server_id": "123" }
```

### Manage SSL Certificates

```json
// List existing certs (forge)
{ "resource": "certificates", "action": "list", "server_id": "123", "site_id": "456" }

// Request a new Let's Encrypt cert (forge_write)
{ "resource": "certificates", "action": "create", "server_id": "123", "site_id": "456", "domain": "example.com", "type": "new" }

// Activate it (forge_write)
{ "resource": "certificates", "action": "activate", "server_id": "123", "site_id": "456", "id": "789" }
```

### Update Environment Variables

```json
// Get current env (forge)
{ "resource": "env", "action": "get", "server_id": "123", "site_id": "456" }

// Update env (forge_write)
{ "resource": "env", "action": "update", "server_id": "123", "site_id": "456", "content": "APP_ENV=production\nAPP_DEBUG=false" }
```

### Create a Queue Worker

```json
// forge_write
{
  "resource": "daemons",
  "action": "create",
  "server_id": "123",
  "command": "php artisan queue:work --tries=3",
  "user": "forge"
}
```

### Run a Recipe on Multiple Servers

```json
// Create recipe (forge_write)
{ "resource": "recipes", "action": "create", "name": "Clear caches", "script": "php artisan cache:clear" }

// Run it on servers (forge_write)
{ "resource": "recipes", "action": "run", "id": "456", "servers": [1, 2, 3] }
```

### Auto-Resolve: Deploy Using Names Instead of IDs

No need to look up numeric IDs first — just pass names directly:

```json
// Deploy using server name and site domain (forge_write)
// "prod" and "myapp.example.com" are auto-resolved to numeric IDs
{ "resource": "deployments", "action": "deploy", "server_id": "prod", "site_id": "myapp.example.com" }

// Update env using a partial server name and domain fragment
{ "resource": "env", "action": "get", "server_id": "production", "site_id": "myapp" }
```

### Resolve: Find Resources by Name

Use `action: "resolve"` to search resources by name before acting:

```json
// Find servers matching "prod" (forge)
{ "resource": "servers", "action": "resolve", "query": "prod" }
// → returns matches: [{ id: 123, name: "production-web-01" }, ...]

// Find sites on a server matching a domain fragment (forge)
{ "resource": "sites", "action": "resolve", "server_id": "123", "query": "myapp" }
// → returns matches: [{ id: 456, name: "myapp.example.com" }, ...]
```

### Context: Get a Full Snapshot in One Call

`action: "context"` fetches a resource plus all its sub-resources in a single parallel call — ideal for orientation at the start of a session:

```json
// Server context (forge) — returns server + sites, databases, database_users,
//                           daemons, firewall_rules, scheduled_jobs
{ "resource": "servers", "action": "context", "id": "123" }

// Site context (forge) — returns site + deployments (last 5), certificates,
//                          redirect_rules, security_rules
{ "resource": "sites", "action": "context", "server_id": "123", "id": "456" }

// Combine with auto-resolve: use names instead of IDs
{ "resource": "servers", "action": "context", "id": "prod" }
```

### Batch: Multiple Reads in a Single Call

`resource: "batch"` with `action: "run"` executes up to 10 read operations in parallel, reducing round-trips:

```json
// Fetch servers list + user info in one call (forge)
{
  "resource": "batch",
  "action": "run",
  "operations": [
    { "resource": "servers", "action": "list" },
    { "resource": "user", "action": "get" }
  ]
}

// Fetch multiple site sub-resources in parallel (forge)
{
  "resource": "batch",
  "action": "run",
  "operations": [
    { "resource": "env",          "action": "get",  "server_id": "123", "site_id": "456" },
    { "resource": "certificates", "action": "list", "server_id": "123", "site_id": "456" },
    { "resource": "deployments",  "action": "list", "server_id": "123", "site_id": "456" }
  ]
}
```

Result shape:

```json
{
  "_batch": { "total": 2, "succeeded": 2, "failed": 0 },
  "results": [
    { "index": 0, "resource": "servers", "action": "list", "data": [...] },
    { "index": 1, "resource": "user",    "action": "get",  "data": {...} }
  ]
}
```

Per-operation failures are isolated — a single error doesn't abort the rest.

> **Note**: Batch only supports read actions (`list`, `get`, `resolve`, `context`, `help`, `schema`). Write operations must use `forge_write` individually.

## Authentication

### Stdio Mode (Claude Desktop)

Set `FORGE_API_TOKEN` environment variable, or use the `forge_configure` tool:

```json
// Configure interactively
{ tool: "forge_configure", arguments: { api_token: "your-token" } }

// Check current config
{ tool: "forge_get_config", arguments: {} }
```

### Getting Your API Token

1. Log into [Laravel Forge](https://forge.laravel.com)
2. Go to **Account → API Tokens**
3. Create a new token
4. Copy the token (shown only once)

## Read-Only Mode

The server can run in read-only mode where the `forge_write` tool is not available at all:

```bash
forge-mcp --read-only
# or
FORGE_READ_ONLY=true forge-mcp
```

When enabled, only `forge` (read operations), `forge_configure`, and `forge_get_config` are registered.

## Audit Logging

All `forge_write` operations are automatically logged to `~/.config/forge-tools/audit.log` (configurable via `FORGE_AUDIT_LOG` env var). Sensitive fields (tokens, passwords) are redacted. Logging never interrupts operations.

## Tips for Efficient Usage

1. **Use help first**: Call `action="help"` for any resource before using it
2. **Use schema for specs**: Call `action="schema"` for compact field metadata
3. **Start with list**: Use `action="list"` to discover existing resources
4. **Chain operations**: List servers → list sites → deploy (follow the hierarchy)
5. **Scope matters**: Server-scoped resources need `server_id`, site-scoped need both `server_id` and `site_id`
6. **Read vs Write**: Use `forge` for queries, `forge_write` for mutations — MCP clients enforce this split
7. **Use names, not IDs**: Pass server names and site domains directly — they are auto-resolved to numeric IDs
8. **Use `context` for orientation**: One call fetches a server or site plus all its sub-resources in parallel
9. **Use `batch` to cut round-trips**: Bundle up to 10 read operations into a single `forge` call
10. **Use `resolve` to preview**: Search for resources by name before committing to an action
