# Forge API v2 Migration Plan

## Context

The Forge v1 API (`/api/v1/...`) is deprecated with a sunset date of **March 31, 2026**. The new API (`/api/...`) uses a JSON:API-like format with organizations, scoped tokens, and cursor-based pagination.

OpenAPI spec saved at: `docs/forge-openapi-v2.json`

## Key differences v1 → v2

| Aspect            | v1                                             | v2                                                           |
| ----------------- | ---------------------------------------------- | ------------------------------------------------------------ |
| Base URL          | `https://forge.laravel.com/api/v1`             | `https://forge.laravel.com/api`                              |
| URL structure     | `/servers/{id}/sites/{id}`                     | `/orgs/{slug}/servers/{id}/sites/{id}`                       |
| Response format   | Plain JSON `{ "server": {...} }`               | JSON:API `{ "data": { "id", "type", "attributes": {...} } }` |
| Pagination        | Page-number (`?page=2`)                        | Cursor-based (`page[cursor]=...&page[size]=30`)              |
| Auth tokens       | Unscoped bearer tokens                         | Scoped tokens (requires new token generation)                |
| Deployments list  | `/deployment-history`                          | `/deployments`                                               |
| Deployment output | `/deployment-history/{id}/output` → `{output}` | `/deployments/{id}/log` → JSON:API resource                  |
| Deploy trigger    | `/deployment/deploy` (POST)                    | `/deployments` (POST)                                        |
| Deployment status | Poll `site.deployment_status`                  | `GET /deployments/status`                                    |

## Impacted packages

### 1. `forge-api` (HTTP client + types)

- **Base URL**: Change default from `/api/v1` to `/api`
- **Types**: All response types change from `{ resource: {...} }` to JSON:API `{ data: { id, type, attributes, relationships, links } }`
- **Pagination**: New `PaginatedResponse<T>` type with `meta.next_cursor`, `meta.prev_cursor`, `links.next`, `links.prev`
- **Config**: Add `organizationSlug` to config (required for all org-scoped endpoints)
- **Rate limiting**: Same (60 req/min), same headers

### 2. `forge-sdk` (fluent API)

- All resource collections need org prefix: `forge.org('slug').servers()`
- Response unwrapping: `response.data.attributes` instead of `response.server`
- Pagination helpers: Switch from page-number to cursor-based iteration

### 3. `forge-core` (executors)

- All URL builders need org slug parameter
- All response parsers need JSON:API unwrapping
- Deployment streaming: Use `/deployments/status` + `/deployments/{id}/log`

### 4. `forge-mcp` (MCP server)

- Add `organization` parameter (or auto-detect from config)
- Response formatting adapts to JSON:API structure

### 5. `forge-cli` (CLI tool)

- Add `--org` flag or config default
- Display adapts to new response structure

## Migration strategy

### Phase 1: Dual-mode HTTP client

Add v2 support to `forge-api` without breaking v1:

- [ ] Add `apiVersion: 'v1' | 'v2'` option to `HttpClient`/config
- [ ] Add `organizationSlug` to `ConfigStore`
- [ ] Add JSON:API response types (`JsonApiResource`, `JsonApiDocument`, `PaginatedJsonApiDocument`)
- [ ] Add JSON:API response unwrapping helper
- [ ] Add cursor-based pagination types
- [ ] Update `HttpClient` to use `/api` base URL when `apiVersion: 'v2'`

### Phase 2: Core executors v2

Port all executors to work with v2 API:

- [ ] Add org slug to all URL builders
- [ ] Update all response parsers for JSON:API format
- [ ] Update deployment streaming to use v2 endpoints
- [ ] Update all tests

### Phase 3: SDK v2

- [ ] Add `org()` method to Forge class
- [ ] Update all resource collections for JSON:API
- [ ] Update pagination to cursor-based

### Phase 4: MCP + CLI

- [ ] Add organization config/parameter
- [ ] Update formatters for JSON:API data
- [ ] Update help text

### Phase 5: Remove v1

- [ ] Remove v1 code paths
- [ ] Clean up types
- [ ] Update docs

## New API endpoints summary (147 endpoints, 24 resource groups)

| Resource             | Endpoints | Notes                                                     |
| -------------------- | --------- | --------------------------------------------------------- |
| Background Processes | 6         | New: actions endpoint                                     |
| Backups              | 10        | Restructured under `/database/backups`                    |
| Commands             | 5         | Same structure                                            |
| Databases            | 11        | Restructured under `/database/schemas`, `/database/users` |
| Deployments          | 16        | New: status, deploy-hook, push-to-deploy endpoints        |
| Firewall Rules       | 4         | Same structure                                            |
| Integrations         | 20        | New resource group                                        |
| Logs                 | 2         | Server logs by key                                        |
| Monitors             | 4         | Same structure                                            |
| Nginx                | 5         | Same structure                                            |
| Organizations        | 7         | **New**: org management, VPCs                             |
| Providers            | 8         | Top-level (no org prefix)                                 |
| Recipes              | 14        | New: forge recipes, team recipes                          |
| Redirect Rules       | 4         | Same structure                                            |
| Roles                | 10        | **New**: RBAC system                                      |
| SSH Keys             | 6         | New: public key get/update                                |
| Scheduled Jobs       | 10        | Site-scoped jobs added                                    |
| Security Rules       | 5         | Same structure                                            |
| Server Credentials   | 3         | Team-scoped                                               |
| Servers              | 43        | Major expansion: PHP management, services, events         |
| Sites                | 49        | Major expansion: domains, heartbeats, integrations, logs  |
| Storage Providers    | 5         | Same structure                                            |
| Teams                | 13        | **New**: team management                                  |
| User                 | 2         | `/user` and `/me`                                         |
