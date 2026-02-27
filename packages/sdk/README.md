# @studiometa/forge-sdk

[![npm version](https://img.shields.io/npm/v/@studiometa/forge-sdk?style=flat&colorB=3e63dd&colorA=414853)](https://www.npmjs.com/package/@studiometa/forge-sdk)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat&colorB=3e63dd&colorA=414853)](https://opensource.org/licenses/MIT)

**The missing TypeScript SDK for Laravel Forge.** Fluent, chainable, fully-typed API client.

The official Forge SDK exists only in PHP (`laravel/forge-sdk`). This package fills the gap with a modern TypeScript SDK that mirrors the Forge URL structure in a fluent, chainable API.

## Installation

```bash
npm install @studiometa/forge-sdk
```

## Quick Start

```typescript
import { Forge } from "@studiometa/forge-sdk";

const forge = new Forge("your-api-token");

// List all servers
const servers = await forge.servers.list();

// Get a specific server
const server = await forge.servers.get(123);

// Deploy a site
await forge.server(123).site(456).deploy();

// Get environment variables
const env = await forge.server(123).site(456).env.get();

// Update environment
await forge.server(123).site(456).env.update("APP_ENV=production\nAPP_DEBUG=false");
```

## API Reference

### Servers

```typescript
// Collection operations
forge.servers.list()                    // List all servers
forge.servers.get(id)                   // Get a server
forge.servers.create({ ... })           // Create a server
forge.servers.update(id, { ... })       // Update a server
forge.servers.delete(id)                // Delete a server
forge.servers.reboot(id)                // Reboot a server
forge.servers.resolve('prod')           // Find servers by name

// Resource with nested access
forge.server(id).get()                  // Get server details
forge.server(id).reboot()               // Reboot server
forge.server(id).delete()               // Delete server
forge.server(id).sites.list()           // List sites on server
forge.server(id).databases.list()       // List databases
forge.server(id).daemons.list()         // List daemons
```

#### `servers.resolve(query)`

Find servers by name using **case-insensitive partial matching**. If exactly one server matches the query exactly (whole name), only that server is returned — otherwise all partial matches are returned.

```typescript
const result = await forge.servers.resolve("prod");
// → { query: 'prod', matches: [{ id: 725393, name: 'wilo-grove-prod' }], total: 1 }

if (result.total === 1) {
  const sites = await forge.server(result.matches[0].id).sites.list();
} else if (result.total === 0) {
  console.error("No server found for:", result.query);
} else {
  console.error(
    "Ambiguous query, matched:",
    result.matches.map((m) => m.name),
  );
}
```

### Sites

```typescript
// Collection operations
forge.server(id).sites.list()           // List all sites
forge.server(id).sites.get(siteId)      // Get a site
forge.server(id).sites.create({ domain: 'example.com', project_type: 'php' })
forge.server(id).sites.update(siteId, { ... })
forge.server(id).sites.delete(siteId)
forge.server(id).sites.resolve('example') // Find sites by domain name

// Resource with nested access
forge.server(id).site(siteId).get()         // Get site details
forge.server(id).site(siteId).deploy()      // Deploy site
forge.server(id).site(siteId).delete()      // Delete site
forge.server(id).site(siteId).env.get()     // Get .env content
forge.server(id).site(siteId).env.update('...')  // Update .env
forge.server(id).site(siteId).nginx.get()   // Get Nginx config
forge.server(id).site(siteId).nginx.update('...')  // Update Nginx
```

#### `sites.resolve(query)`

Find sites by domain name using **case-insensitive partial matching**. Same priority logic as `servers.resolve()`: an exact match wins if there is exactly one, otherwise all partial matches are returned.

```typescript
const result = await forge.server(123).sites.resolve("example");
// → { query: 'example', matches: [{ id: 456, name: 'example.com' }], total: 1 }

if (result.total === 1) {
  await forge.server(123).site(result.matches[0].id).deploy();
} else if (result.total === 0) {
  console.error("No site found for:", result.query);
} else {
  console.error(
    "Ambiguous query, matched:",
    result.matches.map((m) => m.name),
  );
}
```

### Types: `ResolveResult` and `ResolveMatch`

Both `servers.resolve()` and `sites.resolve()` return a `ResolveResult`:

```typescript
interface ResolveMatch {
  id: number; // Forge resource ID
  name: string; // Server name or site domain
}

interface ResolveResult {
  query: string; // The original search query
  matches: ResolveMatch[]; // Matched resources (empty if none)
  total: number; // Number of matches (0, 1, or many)
}
```

Both types are exported from the package:

```typescript
import type { ResolveMatch, ResolveResult } from "@studiometa/forge-sdk";
```

### Deployments

```typescript
forge.server(id).site(siteId).deployments.list(); // List deployments
forge.server(id).site(siteId).deployments.get(depId); // Get deployment
forge.server(id).site(siteId).deployments.output(depId); // Get output
forge.server(id).site(siteId).deployments.script(); // Get deploy script
forge.server(id).site(siteId).deployments.updateScript("npm run build");
```

### Certificates

```typescript
forge.server(id).site(siteId).certificates.list();
forge.server(id).site(siteId).certificates.get(certId);
forge.server(id).site(siteId).certificates.create({ type: "new", domain: "example.com" });
forge.server(id).site(siteId).certificates.letsEncrypt(["example.com"]);
forge.server(id).site(siteId).certificates.activate(certId);
forge.server(id).site(siteId).certificates.delete(certId);
```

### Databases

```typescript
forge.server(id).databases.list();
forge.server(id).databases.get(dbId);
forge.server(id).databases.create({ name: "myapp", user: "admin", password: "secret" });
forge.server(id).databases.delete(dbId);
```

### Daemons (Background Processes)

```typescript
forge.server(id).daemons.list();
forge.server(id).daemons.get(daemonId);
forge.server(id).daemons.create({ command: "php artisan queue:work", user: "forge" });
forge.server(id).daemons.restart(daemonId);
forge.server(id).daemons.delete(daemonId);
```

### User

```typescript
const user = await forge.user();
console.log(user.name, user.email);
```

## Comparison with PHP SDK

| Feature         | PHP (`laravel/forge-sdk`) | TypeScript (`@studiometa/forge-sdk`) |
| --------------- | ------------------------- | ------------------------------------ |
| Language        | PHP                       | TypeScript/JavaScript                |
| API style       | Method calls              | Fluent chainable                     |
| Type safety     | PHPDoc                    | Full TypeScript types                |
| Node.js support | ❌                        | ✅ Native                            |
| GitHub Actions  | Via PHP setup             | Native `npm install`                 |
| Rate limiting   | Manual                    | Built-in (60 req/min)                |
| Error types     | Generic                   | Typed `ForgeApiError`                |

## Testing

The SDK supports dependency injection for testing:

```typescript
const mockFetch = async (url, init) => {
  return new Response(JSON.stringify({ servers: [] }), {
    headers: { "content-type": "application/json" },
  });
};

const forge = new Forge("test-token", { fetch: mockFetch });
const servers = await forge.servers.list(); // Uses mock fetch
```

## GitHub Actions Example

```typescript
import { Forge } from "@studiometa/forge-sdk";

const forge = new Forge(process.env.FORGE_API_TOKEN);

// Deploy after successful CI using resolve() to find the server and site by name
const serverResult = await forge.servers.resolve("prod");
if (serverResult.total !== 1) {
  console.error("Could not uniquely resolve server:", serverResult);
  process.exit(1);
}

const serverId = serverResult.matches[0].id;
const siteResult = await forge.server(serverId).sites.resolve("myapp.com");
if (siteResult.total !== 1) {
  console.error("Could not uniquely resolve site:", siteResult);
  process.exit(1);
}

await forge.server(serverId).site(siteResult.matches[0].id).deploy();
console.log("Deployment triggered!");
```

## Requirements

- **Node.js 18+** (uses native `fetch`)
- **Laravel Forge account** with API token

## License

MIT © [Studio Meta](https://www.studiometa.fr)
