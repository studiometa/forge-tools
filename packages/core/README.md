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

// RESOURCES: ['servers', 'sites', 'deployments', 'certificates', 'databases', 'daemons', 'env', 'nginx']
// ACTIONS: ['list', 'get', 'create', 'update', 'delete', 'deploy', 'reboot', 'restart', 'activate', 'help', 'schema']
```

## Executors

### Servers

- `listServers(options, ctx)` — List all servers
- `getServer({ server_id }, ctx)` — Get a server
- `createServer(data, ctx)` — Create a server
- `deleteServer({ server_id }, ctx)` — Delete a server
- `rebootServer({ server_id }, ctx)` — Reboot a server

### Sites

- `listSites({ server_id }, ctx)` — List sites on a server
- `getSite({ server_id, site_id }, ctx)` — Get a site
- `createSite({ server_id, ...data }, ctx)` — Create a site
- `deleteSite({ server_id, site_id }, ctx)` — Delete a site

### Deployments

- `listDeployments({ server_id, site_id }, ctx)` — List deployments
- `deploySite({ server_id, site_id }, ctx)` — Trigger deployment
- `getDeploymentOutput({ server_id, site_id, deployment_id }, ctx)` — Get output
- `getDeploymentScript({ server_id, site_id }, ctx)` — Get deploy script
- `updateDeploymentScript({ server_id, site_id, content }, ctx)` — Update script

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
