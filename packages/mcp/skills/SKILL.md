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

MCP (Model Context Protocol) server for [Laravel Forge](https://forge.laravel.com). Provides a single unified `forge` tool for all operations.

## Quick Start

Before your first interaction with any resource, call `action="help"` with that resource to discover required fields and examples.

## The `forge` Tool

Single unified tool with this signature:

```
forge(resource, action, [parameters...])
```

### Resources & Actions

| Resource          | Actions                                       | Scope  |
| ----------------- | --------------------------------------------- | ------ |
| `servers`         | `list`, `get`, `create`, `delete`, `reboot`   | global |
| `sites`           | `list`, `get`, `create`, `delete`             | server |
| `deployments`     | `list`, `deploy`, `get`, `update`             | site   |
| `env`             | `get`, `update`                               | site   |
| `nginx`           | `get`, `update`                               | site   |
| `certificates`    | `list`, `get`, `create`, `delete`, `activate` | site   |
| `databases`       | `list`, `get`, `create`, `delete`             | server |
| `database-users`  | `list`, `get`, `create`, `delete`             | server |
| `daemons`         | `list`, `get`, `create`, `delete`, `restart`  | server |
| `firewall-rules`  | `list`, `get`, `create`, `delete`             | server |
| `ssh-keys`        | `list`, `get`, `create`, `delete`             | server |
| `security-rules`  | `list`, `get`, `create`, `delete`             | site   |
| `redirect-rules`  | `list`, `get`, `create`, `delete`             | site   |
| `monitors`        | `list`, `get`, `create`, `delete`             | server |
| `nginx-templates` | `list`, `get`, `create`, `update`, `delete`   | server |
| `recipes`         | `list`, `get`, `create`, `delete`, `run`      | global |

### Scope Guide

- **global**: No parent ID needed (e.g. `servers`, `recipes`)
- **server**: Requires `server_id` (e.g. `sites`, `databases`, `daemons`)
- **site**: Requires `server_id` + `site_id` (e.g. `deployments`, `env`, `certificates`)

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

| Parameter   | Type    | Description                                                   |
| ----------- | ------- | ------------------------------------------------------------- |
| `resource`  | string  | **Required**. Resource type (see table above)                 |
| `action`    | string  | **Required**. Action to perform                               |
| `id`        | string  | Resource ID (for `get`, `delete`, `activate`, `restart`)      |
| `server_id` | string  | Server ID (for server-scoped and site-scoped resources)       |
| `site_id`   | string  | Site ID (for site-scoped resources)                           |
| `compact`   | boolean | Compact output (default: true)                                |
| `content`   | string  | Content for env/nginx `update` and deployment script `update` |

## Common Workflows

### Deploy a Site

```json
// 1. Find the server
{ "resource": "servers", "action": "list" }

// 2. Find the site
{ "resource": "sites", "action": "list", "server_id": "123" }

// 3. Deploy
{ "resource": "deployments", "action": "deploy", "server_id": "123", "site_id": "456" }

// 4. Check deployment status
{ "resource": "deployments", "action": "list", "server_id": "123", "site_id": "456" }
```

### Check Server Status

```json
// Get server details
{ "resource": "servers", "action": "get", "id": "123" }

// List sites on server
{ "resource": "sites", "action": "list", "server_id": "123" }

// List databases
{ "resource": "databases", "action": "list", "server_id": "123" }

// List background processes
{ "resource": "daemons", "action": "list", "server_id": "123" }
```

### Manage SSL Certificates

```json
// List existing certs
{ "resource": "certificates", "action": "list", "server_id": "123", "site_id": "456" }

// Request a new Let's Encrypt cert
{ "resource": "certificates", "action": "create", "server_id": "123", "site_id": "456", "domain": "example.com", "type": "new" }

// Activate it
{ "resource": "certificates", "action": "activate", "server_id": "123", "site_id": "456", "id": "789" }
```

### Update Environment Variables

```json
// Get current env
{ "resource": "env", "action": "get", "server_id": "123", "site_id": "456" }

// Update env
{ "resource": "env", "action": "update", "server_id": "123", "site_id": "456", "content": "APP_ENV=production\nAPP_DEBUG=false" }
```

### Create a Queue Worker

```json
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
// Create recipe
{ "resource": "recipes", "action": "create", "name": "Clear caches", "script": "php artisan cache:clear" }

// Run it on servers
{ "resource": "recipes", "action": "run", "id": "456", "servers": [1, 2, 3] }
```

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

## Tips for Efficient Usage

1. **Use help first**: Call `action="help"` for any resource before using it
2. **Use schema for specs**: Call `action="schema"` for compact field metadata
3. **Start with list**: Use `action="list"` to discover existing resources
4. **Chain operations**: List servers → list sites → deploy (follow the hierarchy)
5. **Scope matters**: Server-scoped resources need `server_id`, site-scoped need both `server_id` and `site_id`
