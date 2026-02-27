# @studiometa/forge-core

[![npm version](https://img.shields.io/npm/v/@studiometa/forge-core?style=flat&colorB=3e63dd&colorA=414853)](https://www.npmjs.com/package/@studiometa/forge-core)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat&colorB=3e63dd&colorA=414853)](https://opensource.org/licenses/MIT)

Shared business logic for Laravel Forge tools — pure executor functions with injectable dependencies. Used internally by `@studiometa/forge-mcp`.

## Architecture

Executors are pure functions with dependency injection via `ExecutorContext`:

```typescript
import { listServers, createTestExecutorContext } from "@studiometa/forge-core";

const ctx = createTestExecutorContext({
  client: mockClient,
});

const result = await listServers({}, ctx);
console.log(result.text); // "2 server(s): ..."
console.log(result.data); // ForgeServer[]
```

## Constants

`RESOURCES` and `ACTIONS` are the single source of truth for the entire monorepo:

```typescript
import { RESOURCES, ACTIONS } from "@studiometa/forge-core";

// RESOURCES: ['servers', 'sites', 'deployments', 'certificates', 'databases',
//   'database-users', 'daemons', 'env', 'nginx', 'firewall-rules', 'ssh-keys',
//   'security-rules', 'redirect-rules', 'nginx-templates', 'monitors', 'recipes',
//   'backups', 'commands', 'scheduled-jobs', 'user', 'batch']
// ACTIONS: ['list', 'get', 'create', 'update', 'delete', 'deploy', 'reboot', 'restart',
//   'activate', 'run', 'resolve', 'help', 'schema', 'context']
```

## Executors

### Servers

- `listServers(options, ctx)` — List all servers
- `getServer({ server_id }, ctx)` — Get a server
- `createServer(data, ctx)` — Create a server
- `deleteServer({ server_id }, ctx)` — Delete a server
- `rebootServer({ server_id }, ctx)` — Reboot a server
- `resolveServers({ query }, ctx)` — Resolve servers by name (partial, case-insensitive); returns `ResolveResult` with `query`, `matches` (`id` + `name`), and `total`

### Sites

- `listSites({ server_id }, ctx)` — List sites on a server
- `getSite({ server_id, site_id }, ctx)` — Get a site
- `createSite({ server_id, ...data }, ctx)` — Create a site
- `deleteSite({ server_id, site_id }, ctx)` — Delete a site
- `resolveSites({ server_id, query }, ctx)` — Resolve sites by domain name (partial, case-insensitive); returns `ResolveSiteResult` with `query`, `matches` (`id` + `name`), and `total`

### Deployments

- `listDeployments({ server_id, site_id }, ctx)` — List deployments
- `deploySite({ server_id, site_id }, ctx)` — Trigger deployment
- `deploySiteAndWait({ server_id, site_id, timeout_ms?, poll_interval_ms? }, ctx)` — Deploy and poll until complete, returns `DeployResult` with status, log, and elapsed time
- `getDeploymentLog({ server_id, site_id }, ctx)` — Get the latest deployment log
- `getDeploymentOutput({ server_id, site_id, deployment_id }, ctx)` — Get output
- `getDeploymentScript({ server_id, site_id }, ctx)` — Get deploy script
- `updateDeploymentScript({ server_id, site_id, content }, ctx)` — Update script

### Certificates

- `listCertificates`, `getCertificate`, `createCertificate`, `deleteCertificate`, `activateCertificate`

### Databases

- `listDatabases`, `getDatabase`, `createDatabase`, `deleteDatabase`

### Database Users

- `listDatabaseUsers`, `getDatabaseUser`, `createDatabaseUser`, `deleteDatabaseUser`

### Daemons

- `listDaemons`, `getDaemon`, `createDaemon`, `deleteDaemon`, `restartDaemon`

### Firewall Rules

- `listFirewallRules`, `getFirewallRule`, `createFirewallRule`, `deleteFirewallRule`

### SSH Keys

- `listSshKeys`, `getSshKey`, `createSshKey`, `deleteSshKey`

### Security Rules

- `listSecurityRules`, `getSecurityRule`, `createSecurityRule`, `deleteSecurityRule`

### Redirect Rules

- `listRedirectRules`, `getRedirectRule`, `createRedirectRule`, `deleteRedirectRule`

### Monitors

- `listMonitors`, `getMonitor`, `createMonitor`, `deleteMonitor`

### Nginx Templates

- `listNginxTemplates`, `getNginxTemplate`, `createNginxTemplate`, `updateNginxTemplate`, `deleteNginxTemplate`

### Recipes

- `listRecipes`, `getRecipe`, `createRecipe`, `deleteRecipe`, `runRecipe`

### Backups

- `listBackupConfigs`, `getBackupConfig`, `createBackupConfig`, `deleteBackupConfig`

### Commands

- `listCommands`, `getCommand`, `createCommand`

### Scheduled Jobs

- `listScheduledJobs`, `getScheduledJob`, `createScheduledJob`, `deleteScheduledJob`

### User

- `getUser(options, ctx)` — Get the authenticated user's profile

## Utilities

### `matchByName(items, query, getName)`

Case-insensitive exact and partial name matching — used internally by `resolveServers` and `resolveSites`, but exported for reuse:

```typescript
import { matchByName } from "@studiometa/forge-core";

const result = matchByName(servers, "my-server", (s) => s.name);
// result.exact  — items whose name matches exactly (case-insensitive)
// result.partial — items whose name contains the query (includes exact matches)
```

**Signature:**

```typescript
function matchByName<T>(items: T[], query: string, getName: (item: T) => string): NameMatch<T>;

interface NameMatch<T> {
  exact: T[];
  partial: T[];
}
```

## Audit Logging

A shared audit logger for tracking write operations across MCP and CLI:

```typescript
import { createAuditLogger } from "@studiometa/forge-core";

const logger = createAuditLogger("mcp"); // or 'cli'

logger.log({
  source: "mcp",
  resource: "servers",
  action: "reboot",
  args: { id: "123" },
  status: "success",
});
```

- Logs JSON lines via [pino](https://github.com/pinojs/pino) to `~/.config/forge-tools/audit.log`
- Override path with `FORGE_AUDIT_LOG` environment variable
- Sensitive fields (`apiToken`, `token`, `password`, `secret`, `key`, `credentials`) are automatically redacted
- Silent no-op on failure — never interrupts the actual operation

### Utilities

- `sanitizeArgs(args)` — Strip sensitive fields from an args object
- `getAuditLogPath()` — Resolve the audit log file path

## Testing

```typescript
import { createTestExecutorContext } from "@studiometa/forge-core";

// Creates a context with a proxy client that throws on unmocked methods
const ctx = createTestExecutorContext();

// Override specific methods
const ctx = createTestExecutorContext({
  client: {
    get: async () => ({ servers: [{ id: 1, name: "test" }] }),
  } as never,
});
```

## License

MIT © [Studio Meta](https://www.studiometa.fr)
