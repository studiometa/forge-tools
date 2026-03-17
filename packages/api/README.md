# @studiometa/forge-api

[![npm version](https://img.shields.io/npm/v/@studiometa/forge-api?style=flat&colorB=3e63dd&colorA=414853)](https://www.npmjs.com/package/@studiometa/forge-api)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat&colorB=3e63dd&colorA=414853)](https://opensource.org/licenses/MIT)

Internal HTTP client, TypeScript types, configuration storage, and rate limiting for the Laravel Forge API. This is the foundation package for all `@studiometa/forge-*` packages.

> **Note**: Most users should use [`@studiometa/forge-sdk`](../sdk) instead, which provides a fluent, chainable API on top of this package.

## Installation

```bash
npm install @studiometa/forge-api
```

## Usage

### HTTP Client

```typescript
import { HttpClient } from '@studiometa/forge-api';

const client = new HttpClient({
  token: 'your-api-token',
});

// Direct API calls (base URL: https://forge.laravel.com/api)
const response = await client.get('/orgs/my-org/servers');
const server = await client.post('/orgs/my-org/servers', { name: 'web-1', ... });
await client.delete('/orgs/my-org/servers/123');
```

### Configuration

Read API token and organization slug from environment variables or config file:

```typescript
import {
  getToken,
  setToken,
  deleteToken,
  getOrganizationSlug,
  setOrganizationSlug,
} from "@studiometa/forge-api";

// Resolution: FORGE_API_TOKEN env var > config file
const token = getToken();

// Resolution: FORGE_ORG env var > config file
const orgSlug = getOrganizationSlug();

// Save to config file (~/.config/forge-tools/config.json)
setToken("your-token");
setOrganizationSlug("my-org");

// Remove token from config
deleteToken();
```

### JSON:API Response Helpers

The Forge v2 API returns JSON:API-formatted responses. Use these helpers to unwrap them:

```typescript
import { HttpClient, unwrapDocument, unwrapListDocument } from "@studiometa/forge-api";
import type {
  JsonApiDocument,
  JsonApiListDocument,
  ServerAttributes,
  SiteAttributes,
} from "@studiometa/forge-api";

const client = new HttpClient({ token: "your-token" });

// Single resource
const doc = await client.get<JsonApiDocument<ServerAttributes>>("/orgs/my-org/servers/123");
const server = unwrapDocument(doc); // ServerAttributes & { id: number }

// List of resources
const listDoc = await client.get<JsonApiListDocument<SiteAttributes>>(
  "/orgs/my-org/servers/123/sites",
);
const sites = unwrapListDocument(listDoc); // Array<SiteAttributes & { id: number }>
```

### Error Handling

```typescript
import { ForgeApiError, isForgeApiError } from "@studiometa/forge-api";

try {
  await client.get("/orgs/my-org/servers/999");
} catch (error) {
  if (isForgeApiError(error)) {
    console.log(error.status); // 404
    console.log(error.statusText); // "Resource not found"
    console.log(error.url); // "/orgs/my-org/servers/999"
    console.log(error.body); // API response body
  }
}
```

### Rate Limiting

The HTTP client includes automatic rate limiting (60 requests/minute) with exponential backoff on 429 responses:

```typescript
const client = new HttpClient({
  token: "your-token",
  rateLimit: {
    maxRetries: 3, // Max retries on 429 (default: 3)
    baseDelay: 1000, // Base delay in ms (default: 1000)
  },
});
```

### Dependency Injection (Testing)

```typescript
const mockFetch = async () => ({
  ok: true,
  status: 200,
  headers: new Headers({ "content-type": "application/json" }),
  json: async () => ({ data: [] }),
  text: async () => "{}",
});

const client = new HttpClient({
  token: "test",
  fetch: mockFetch,
});
```

## Exports

| Export                                                             | Description                                           |
| ------------------------------------------------------------------ | ----------------------------------------------------- |
| `HttpClient`                                                       | Low-level HTTP client with auth, rate limiting, retry |
| `ForgeApiError`                                                    | Typed error with status, url, body                    |
| `isForgeApiError()`                                                | Type guard for ForgeApiError                          |
| `RateLimiter`                                                      | Sliding window rate limiter (60 req/min)              |
| `ConfigStore`                                                      | XDG-compliant JSON config store                       |
| `getToken` / `setToken` / `deleteToken`                            | Token management helpers                              |
| `getOrganizationSlug` / `setOrganizationSlug`                      | Organization slug management helpers                  |
| `unwrapDocument` / `unwrapListDocument` / `unwrapResource`         | JSON:API response unwrapping helpers                  |
| `JsonApiDocument`, `JsonApiListDocument`, etc.                     | JSON:API type definitions                             |
| `ServerAttributes`, `SiteAttributes`, `DeploymentAttributes`, etc. | v2 resource attribute types                           |
| `CreateServerData`, `CreateSiteData`, etc.                         | Input types for create operations                     |

## Config Storage

| Platform | Path                                                    |
| -------- | ------------------------------------------------------- |
| Linux    | `~/.config/forge-tools/config.json`                     |
| macOS    | `~/Library/Application Support/forge-tools/config.json` |
| Windows  | `%APPDATA%/forge-tools/config.json`                     |

Config fields:

- `apiToken` — Forge API token (from Forge dashboard)
- `organizationSlug` — Default organization slug (e.g. `studio-meta`), also via `FORGE_ORG` env var

## License

MIT © [Studio Meta](https://www.studiometa.fr)
