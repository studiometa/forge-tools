# Laravel Forge Tools

[![CI](https://github.com/studiometa/forge-tools/actions/workflows/ci.yml/badge.svg)](https://github.com/studiometa/forge-tools/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat&colorB=3e63dd&colorA=414853)](https://opensource.org/licenses/MIT)

**The missing TypeScript SDK for Laravel Forge** — plus an MCP server for AI agents.

The official Forge SDK exists only in PHP. This project fills the gap with a fully-typed TypeScript SDK and an MCP server that puts every Forge endpoint in the hands of AI agents.

## Packages

| Package                                     | Description                                            |
| ------------------------------------------- | ------------------------------------------------------ |
| [`@studiometa/forge-sdk`](./packages/sdk)   | **Fluent, chainable TypeScript SDK** for Laravel Forge |
| [`@studiometa/forge-cli`](./packages/cli)   | CLI tool for managing Forge servers, sites, and more   |
| [`@studiometa/forge-mcp`](./packages/mcp)   | MCP server for Claude Desktop and other MCP clients    |
| [`@studiometa/forge-core`](./packages/core) | Shared business logic — executor functions with DI     |
| [`@studiometa/forge-api`](./packages/api)   | Internal API client, types, config, and rate limiter   |

## Quick Start

### CLI

```bash
npm install -g @studiometa/forge-cli
```

```bash
# Save your API token
forge-cli config set YOUR_FORGE_TOKEN

# List all servers
forge-cli servers list

# List sites on a server
forge-cli sites list --server 123

# Deploy a site
forge-cli deployments deploy --server 123 --site 456

# Get JSON output (for scripting and AI agents)
forge-cli servers list --format json
```

### SDK

```bash
npm install @studiometa/forge-sdk
```

```typescript
import { Forge } from "@studiometa/forge-sdk";

const forge = new Forge("your-api-token");

// List all servers
const servers = await forge.servers.list();

// Deploy a site
await forge.server(123).site(456).deploy();

// Get environment variables
const env = await forge.server(123).site(456).env.get();

// Manage databases
const dbs = await forge.server(123).databases.list();
```

### MCP Server (Claude Desktop)

```bash
npm install -g @studiometa/forge-mcp
```

Add to your Claude Desktop config:

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

Two tools with a clear safety split:

- **`forge`** — read-only operations (`list`, `get`, `resolve`, `context`, `help`, `schema`) — auto-approvable
- **`forge_write`** — write operations (`create`, `update`, `delete`, `deploy`, `reboot`, `restart`, `activate`, `run`, `batch`, etc.) — always requires confirmation

Key MCP features:

- **Auto-resolve** — pass a server/site name instead of a numeric ID and the MCP server resolves it automatically
- **Batch operations** — use the `batch` resource to run multiple actions in a single tool call
- **Context dump** — the `context` action returns a structured snapshot of your Forge account for fast AI reasoning

For a read-only setup (no writes possible), use `"args": ["--read-only"]` or `FORGE_READ_ONLY=true`.

## Getting Your API Token

1. Log into [Laravel Forge](https://forge.laravel.com)
2. Go to **Account → API Tokens**
3. Create a new token with the scopes you need
4. Copy the token (it's only shown once)

## Requirements

- **Node.js 18+** (SDK and API packages)
- **Node.js 24+** (for development)
- **Laravel Forge account** with API access

## Architecture

```
forge-api   → (nothing)       # HTTP client, types, config, rate limiter
forge-sdk   → forge-api       # Fluent chainable SDK (the hero package)
forge-core  → forge-api       # Executors with DI for MCP and CLI
forge-mcp   → forge-core      # MCP server (stdio transport)
forge-cli   → forge-core      # CLI tool (human + AI agent use)
            → forge-api
```

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md).

## License

MIT © [Studio Meta](https://www.studiometa.fr)
