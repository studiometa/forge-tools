# @studiometa/forge-mcp

[![npm version](https://img.shields.io/npm/v/@studiometa/forge-mcp?style=flat&colorB=3e63dd&colorA=414853)](https://www.npmjs.com/package/@studiometa/forge-mcp)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat&colorB=3e63dd&colorA=414853)](https://opensource.org/licenses/MIT)

MCP (Model Context Protocol) server for [Laravel Forge](https://forge.laravel.com). Enables Claude Desktop and other MCP clients to manage servers, sites, deployments, and more through natural language.

## Features

- Single unified `forge` tool — minimal token overhead
- Resource/action routing from centralized constants
- Built-in help system — `action=help` for any resource
- Stdio transport for local use
- Configuration tools for interactive token setup

## Installation

```bash
npm install -g @studiometa/forge-mcp
```

## Claude Desktop Configuration

Add to your Claude Desktop config:

- **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows**: `%APPDATA%/Claude/claude_desktop_config.json`
- **Linux**: `~/.config/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "forge": {
      "command": "forge-mcp",
      "env": {
        "FORGE_API_TOKEN": "your-api-token"
      }
    }
  }
}
```

Alternatively, omit the `env` block and ask Claude to configure credentials using the `forge_configure` tool.

## The `forge` Tool

A single unified tool with `resource` + `action` routing:

```json
{ "resource": "servers", "action": "list" }
{ "resource": "servers", "action": "get", "id": "123" }
{ "resource": "sites", "action": "list", "server_id": "123" }
{ "resource": "deployments", "action": "deploy", "server_id": "123", "site_id": "456" }
{ "resource": "servers", "action": "help" }
```

### Resources & Actions

| Resource        | Actions                             | Required Fields            |
| --------------- | ----------------------------------- | -------------------------- |
| servers         | list, get, create, delete, reboot   | id (for get/delete/reboot) |
| sites           | list, get, create, delete           | server_id                  |
| deployments     | list, deploy, get, update           | server_id, site_id         |
| env             | get, update                         | server_id, site_id         |
| nginx           | get, update                         | server_id, site_id         |
| certificates    | list, get, create, delete, activate | server_id, site_id         |
| databases       | list, get, create, delete           | server_id                  |
| daemons         | list, get, create, delete, restart  | server_id                  |
| firewall-rules  | list, get, create, delete           | server_id                  |
| ssh-keys        | list, get, create, delete           | server_id                  |
| security-rules  | list, get, create, delete           | server_id, site_id         |
| redirect-rules  | list, get, create, delete           | server_id, site_id         |
| monitors        | list, get, create, delete           | server_id                  |
| nginx-templates | list, get, create, update, delete   | server_id                  |
| recipes         | list, get, create, delete, run      | id (for get/delete/run)    |

### Discovery

Use `action: "help"` with any resource:

```json
{ "resource": "servers", "action": "help" }
{ "resource": "deployments", "action": "help" }
```

## Stdio-Only Tools

| Tool               | Description                        |
| ------------------ | ---------------------------------- |
| `forge_configure`  | Save API token to local config     |
| `forge_get_config` | Show current config (token masked) |

## Getting Your API Token

1. Log into [Laravel Forge](https://forge.laravel.com)
2. Go to **Account → API Tokens**
3. Create a new token with the scopes you need
4. Copy the token (it's only shown once)

## License

MIT © [Studio Meta](https://www.studiometa.fr)
