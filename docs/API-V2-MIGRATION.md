# Forge API v2 Migration

## Context

The Forge v1 API (`/api/v1/...`) was deprecated with a sunset date of March 31, 2026. This project has been fully migrated to the new v2 API (`/api/...`).

**Migration completed in PR [#85](https://github.com/studiometa/forge-tools/pull/85).**

OpenAPI spec saved at: `docs/forge-openapi-v2.json`

## Key differences v1 → v2

| Aspect          | v1 (removed)                       | v2 (current)                                                 |
| --------------- | ---------------------------------- | ------------------------------------------------------------ |
| Base URL        | `https://forge.laravel.com/api/v1` | `https://forge.laravel.com/api`                              |
| URL structure   | `/servers/{id}/sites/{id}`         | `/orgs/{slug}/servers/{id}/sites/{id}`                       |
| Response format | Plain JSON `{ "server": {...} }`   | JSON:API `{ "data": { "id", "type", "attributes": {...} } }` |
| Pagination      | Page-number (`?page=2`)            | Cursor-based (`page[cursor]=...&page[size]=30`)              |
| Auth tokens     | Unscoped bearer tokens             | Scoped tokens                                                |
| Config          | `apiToken` only                    | `apiToken` + `organizationSlug`                              |

## URL mapping applied

| v1 path                        | v2 path                                          |
| ------------------------------ | ------------------------------------------------ |
| `/servers`                     | `/orgs/{slug}/servers`                           |
| `/servers/{id}/daemons`        | `/orgs/{slug}/servers/{id}/background-processes` |
| `/servers/{id}/databases`      | `/orgs/{slug}/servers/{id}/database/schemas`     |
| `/servers/{id}/database-users` | `/orgs/{slug}/servers/{id}/database/users`       |
| `/servers/{id}/keys`           | `/orgs/{slug}/servers/{id}/ssh-keys`             |
| `/servers/{id}/jobs`           | `/orgs/{slug}/servers/{id}/scheduled-jobs`       |
| `/servers/{id}/backup-configs` | `/orgs/{slug}/servers/{id}/database/backups`     |
| `.../deployment-history`       | `.../deployments`                                |
| `.../deployment/deploy`        | `POST .../deployments`                           |
| `.../deployment/script`        | `.../deployments/script`                         |
| `.../env`                      | `.../environment`                                |
| `/recipes`                     | `/orgs/{slug}/recipes`                           |
| `/user`                        | `/user` (unchanged)                              |

## Type mapping applied

All v1 `Forge*` types replaced with `*Attributes & { id: number }`:

| v1 type                          | v2 type                                 |
| -------------------------------- | --------------------------------------- |
| `ForgeServer`                    | `ServerAttributes & { id: number }`     |
| `ForgeSite`                      | `SiteAttributes & { id: number }`       |
| `ForgeDeployment`                | `DeploymentAttributes & { id: number }` |
| `ServersResponse`                | `JsonApiListDocument<ServerAttributes>` |
| `ServerResponse`                 | `JsonApiDocument<ServerAttributes>`     |
| (same pattern for all resources) |                                         |

## Configuration

```bash
# Set API token (scoped token from Forge dashboard)
forge config set apiToken <TOKEN>

# Set default organization slug
forge config set organizationSlug studio-meta

# Or via environment variables
export FORGE_API_TOKEN=<TOKEN>
export FORGE_ORG=studio-meta
```
