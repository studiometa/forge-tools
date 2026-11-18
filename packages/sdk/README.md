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

const forge = new Forge("your-api-token", "your-org-slug");

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

The SDK covers every operation of the [Forge API](https://forge.laravel.com/api/docs). A test checks each method against the OpenAPI spec (`docs/forge-openapi-v2.json`): its route, query parameters and request body.

### Lists: pagination, filters and sort

Each `list()` returns one page, and each `all()` iterates over all pages. Both take the filters, sort fields and includes of the API, typed per resource:

```typescript
await forge.servers.list({ filter: { name: "web" }, sort: ["-created_at"], pageSize: 50 });
await forge.servers.list({ cursor: "next-cursor" }); // A given page
for await (const event of forge.events.all({ include: ["site"] })) {
  console.log(event.description);
}
```

### Servers

```typescript
// Collection operations
forge.servers.list()                    // List all servers
forge.servers.get(id)                   // Get a server
forge.servers.create({ ... })           // Create a server
forge.servers.update(id, { name })      // Update name, IP addresses, timezone or tags
forge.servers.delete(id)                // Delete a server
forge.servers.delete(id, { preserveAtProvider: true }) // Remove it from Forge only
forge.servers.reboot(id)                // Reboot a server
forge.servers.resolve('prod')           // Find servers by name
forge.servers.archives.list()           // Archived servers
forge.servers.archives.archive(id)      // Archive a server
forge.servers.archives.unarchive(id)    // Restore an archived server

// Resource with nested access
forge.server(id).get()                  // Get server details
forge.server(id).reboot()               // Reboot server
forge.server(id).update({ timezone })   // Update server
forge.server(id).action('power-cycle')  // Reboot or power cycle
forge.server(id).delete()               // Delete server
forge.server(id).sites.list()           // List sites on server
forge.server(id).databases.list()       // List databases
forge.server(id).daemons.list()         // List daemons
forge.server(id).events.list()          // Events, with get(eventId) and output(eventId)
forge.server(id).deployments.list()     // Deployments of every site of the server
forge.server(id).network.list()         // Servers in its private network
forge.server(id).network.update([2, 3]) // Replace its private network
forge.server(id).key.get()              // Public key that Forge connects with
forge.server(id).key.regenerate()       // New key pair
forge.server(id).logs.get('nginx_error') // A server log, by key
forge.server(id).logs.clear('nginx_error')
forge.server(id).services.restart('nginx') // nginx, php, mysql, postgres, redis, supervisor
forge.server(id).services.stop('mysql') // nginx, mysql, postgres
forge.server(id).services.reloadPhp('php84')
forge.server(id).firewallRules.list()   // Also monitors, sshKeys, nginxTemplates, scheduledJobs
```

### Organization

```typescript
forge.organizations.list(); // Organizations of the user
forge.organizations.get(); // The organization of the SDK
forge.sites.list({ filter: { name } }); // Sites of every server of the organization
forge.sites.get(siteId);
forge.events.list(); // Recent events of the organization
forge.serverCredentials.list(); // Server provider credentials
forge.serverCredentials.vpcs(credentialId, "fsn1").create("production");
forge.providers.list(); // Server providers
forge.provider("hetzner").regions();
forge.provider("hetzner").region("fsn1").sizes();
forge.roles.create({ name: "Deployer", permissions: ["site:manage-deploys"] });
forge.predefinedRoles.list();
forge.permissions.list();
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
forge.server(id).site(siteId).deployments.updateScript("npm run build", { autoSource: true });
forge.server(id).site(siteId).deployments.status(); // Deployment state
forge.server(id).site(siteId).deployments.resetStatus();
forge.server(id).site(siteId).deployments.deployHook(); // URL that starts a deployment
forge.server(id).site(siteId).deployments.regenerateDeployHook();
forge.server(id).site(siteId).deployments.enablePushToDeploy();
forge.server(id).site(siteId).deployments.disablePushToDeploy();
forge.server(id).site(siteId).webhooks.create("https://example.com/deployed");
```

### Site settings

```typescript
const site = forge.server(id).site(siteId);
site.updateGit({ source_control_provider: "github", repository: "acme/web", branch: "main" });
site.env.update("APP_ENV=production", { cache: true, queues: true });
site.domains.list(); // Also get, create, update, delete, configurations, action, nginx
site.domains.action(domainId, { action: "mark-as-primary" });
site.healthcheck.update("https://example.com/up");
site.logs.get("application"); // "nginx-access", "nginx-error" or "application"
site.deployKey.create(); // Returns the public key
site.composerCredentials.create({ repository, username, password });
site.npmCredentials.create({ registry, token, scopes: ["@acme"] });
site.heartbeats.create({ name: "Backups", grace_period: 5, frequency: 1440 });
site.integrations.horizon.enable(); // horizon, octane, reverb, inertia, pulse, maintenance, scheduler
site.integrations.maintenance.enable({ status: 503 });
site.loadBalancing.update({
  balancer_method: "round_robin",
  balancing: [{ server_id, weight: 1 }],
});
site.scheduledJobs.list(); // Scheduled jobs of the site
site.redirectRules.export(); // CSV
site.redirectRules.import(csv, "replace"); // Returns the number of imported rules
site.redirectRules.reorder([3, 1, 2]);
site.commands.output(commandId);
```

### Certificates

Each domain of a site has its certificates, and one of them is active.

```typescript
// List the certificates of a domain, or of every domain of the site
forge.server(id).site(siteId).certificates.list(domainId);
forge.server(id).site(siteId).certificates.list();
// Get the active certificate of a domain, or a certificate by ID
forge.server(id).site(siteId).certificates.active(domainId);
forge.server(id).site(siteId).certificates.get(domainId, certId);
// Create a certificate
forge.server(id).site(siteId).certificates.create(domainId, { type: "letsencrypt" });
// Activate a certificate
forge.server(id).site(siteId).certificates.activate(domainId, certId);
// Deactivate a certificate
forge.server(id).site(siteId).certificates.deactivate(domainId, certId);
// Delete a certificate
forge.server(id).site(siteId).certificates.delete(domainId, certId);
```

### Databases

```typescript
forge.server(id).databases.list();
forge.server(id).databases.get(dbId);
forge.server(id).databases.create({ name: "myapp", user: "admin", password: "secret" });
forge.server(id).databases.delete(dbId);
forge.server(id).databases.synchronize(); // Add the databases created outside Forge
forge.server(id).databases.updatePassword("secret"); // Root password
forge.server(id).databaseUsers.update(userId, { database_ids: [1, 2] });
forge.server(id).backups.instances(configId).list(); // Backups of a configuration
forge.server(id).backups.instances(configId).create(); // Back up now
forge.server(id).backups.instances(configId).restore(backupId, databaseId);
```

### Daemons (Background Processes)

```typescript
forge.server(id).daemons.list();
forge.server(id).daemons.get(daemonId);
forge.server(id).daemons.create({ command: "php artisan queue:work", user: "forge" });
forge.server(id).daemons.update(daemonId, { name: "queue" });
forge.server(id).daemons.restart(daemonId);
forge.server(id).daemons.action(daemonId, "stop"); // "restart", "stop", "start" or "empty-log"
forge.server(id).daemons.delete(daemonId);
```

### PHP

Version methods take the PHP version ID from `php.list()`.

```typescript
forge.server(id).php.list(); // Installed PHP versions
forge.server(id).php.get(versionId);
forge.server(id).php.install({ version: "php84", site_default: true });
forge.server(id).php.upgrade(versionId); // Latest patch release
forge.server(id).php.uninstall(versionId);
forge.server(id).php.cliVersion(); // Also siteVersion()
forge.server(id).php.setCliVersion("8.4"); // Also setSiteVersion()
forge.server(id).php.config(versionId, "fpm"); // "cli", "fpm" or "pool"
forge.server(id).php.config(versionId, "pool", { user: "forge" });
forge.server(id).php.updateConfig(versionId, "fpm", "memory_limit = 512M\n...");
forge.server(id).php.maxUploadSize(); // Megabytes
forge.server(id).php.setMaxUploadSize(128);
forge.server(id).php.maxExecutionTime(); // Seconds
forge.server(id).php.setMaxExecutionTime(120);
forge.server(id).php.opcache(); // true or false
forge.server(id).php.enableOpcache();
forge.server(id).php.disableOpcache();
```

### Storage Providers

Storage providers are the organization's S3-compatible buckets for database backups.

```typescript
forge.storageProviders.list();
forge.storageProviders.get(providerId);
forge.storageProviders.create({
  name: "Backups",
  provider: "custom", // "s3", "spaces", "hetzner", "ovh", "scaleway" or "custom"
  endpoint: "https://s3.example.com",
  region: "eu-west-1",
  bucket: "my-bucket",
  access_key: "AKIA...",
  secret_key: process.env.S3_SECRET_KEY,
});
forge.storageProviders.update(providerId, { name: "Backups", provider: "custom" });
forge.storageProviders.delete(providerId);
```

### Recipes

```typescript
forge.recipes.list(); // Also get, create, update, delete
forge.recipes.run(recipeId, { servers: [123], email: true });
forge.recipes.runs(recipeId).list(); // Runs, with get(runId) for the output
forge.forgeRecipes.list(); // Recipes of Forge
forge.forgeRecipes.run(recipeId, { servers: [123] });
```

### Teams

Share servers, recipes and credentials with the organization's teams. Team methods take the team ID from `teams.list()`.

```typescript
forge.teams.list();
forge.teams.all(); // Async iterator over all pages
forge.teams.create({ name: "Developers" }); // Also get, update, delete
forge.team(teamId).members.list(); // Also get, update(userId, roleId), remove
forge.team(teamId).invites.create({ email: "jane@example.com", role_id: 3 });
forge.team(teamId).recipes.add(recipeId);
forge.team(teamId).serverCredentials.add(credentialId);
forge.team(teamId).servers.list(); // Servers shared with the team
forge.team(teamId).servers.all();
forge.team(teamId).servers.add(serverId);
forge.team(teamId).servers.remove(serverId);
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
  return new Response(JSON.stringify({ data: [] }), {
    headers: { "content-type": "application/json" },
  });
};

const forge = new Forge("test-token", "test-org", { fetch: mockFetch });
const servers = await forge.servers.list(); // Uses mock fetch
```

## GitHub Actions Example

```typescript
import { Forge } from "@studiometa/forge-sdk";

const forge = new Forge(process.env.FORGE_API_TOKEN, process.env.FORGE_ORG);

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
