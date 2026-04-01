# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## Unreleased

### Breaking

- **All**: Migrate from Forge v1 API (`/api/v1`) to v2 API (`/api`) — all endpoints now use org-scoped URLs, JSON:API response format, and cursor-based pagination [[#85]]
- **All**: Remove all v1 type definitions (`ForgeServer`, `ForgeSite`, etc.) and response wrappers (`ServersResponse`, etc.) — replaced by `ServerAttributes`, `SiteAttributes`, and generic `JsonApiDocument<T>` / `JsonApiListDocument<T>` types [[#85], [0665a7e]]
- **All**: Certificates are now per-domain — `list` removed, all operations require `domain_id` instead of certificate `id`. URL: `/sites/{site}/domains/{domain}/certificate` [[#85], [bf661cf]]
- **API**: Change `HttpClient` default base URL from `https://forge.laravel.com/api/v1` to `https://forge.laravel.com/api` [[#85], [697bae9]]
- **API**: Add `organizationSlug` to `ForgeConfig` — required for all API calls via `FORGE_ORG` env var or config file [[#85], [015e537]]
- **SDK**: `Forge` constructor now takes `(token, organizationSlug, options?)` instead of `(token, options?)` [[#85], [7881230]]
- **SDK**: Switch from page-number to cursor-based pagination — `list({ page })` becomes `list({ cursor })` [[#85], [7881230]]
- **Core**: `ExecutorContext` now requires `organizationSlug` field [[#85], [697bae9]]
- **Core**: Remove `url-builder.ts` (`orgPrefix`, `serverPath`, `sitePath`) — replaced by `ROUTES` registry [[#101], [4c666ce]]
- **Core**: Remove duplicate `getDeploymentOutput` executor (use `getDeploymentLog` instead) [[#101], [ff5615b]]

### Added

- **API**: Add JSON:API generic types (`JsonApiResource`, `JsonApiDocument`, `JsonApiListDocument`, pagination types) [[#85], [37f4f10]]
- **API**: Add v2 resource attribute types for all 25 resources (`ServerAttributes`, `SiteAttributes`, `DeploymentAttributes`, etc.) [[#85], [b34ea27]]
- **API**: Add `unwrapDocument()`, `unwrapListDocument()` helpers to flatten JSON:API responses [[#85], [b0f0e5b]]
- **API**: Add `getOrganizationSlug()` / `setOrganizationSlug()` config helpers [[#85], [015e537]]
- **API**: Add Valibot schemas for all 26 resource attribute types and 16 create data types [[#101], [cba90d6]]
- **API**: Add JSON:API document schema factories (`jsonApiDocumentSchema`, `jsonApiListDocumentSchema`) [[#101], [cba90d6]]
- **API**: Add `HttpClient.patch()` method [[#101], [cba90d6]]
- **API**: Add `SiteRepository`, `EnvironmentAttributes` types [[#85], [a9ce75e]]
- **API**: Add `auto_source` field to `DeploymentScriptAttributes` [[#85], [a9ce75e]]
- **API**: Add missing fields to `CreateServerData` type [[#108], [441d6ae]]
- **API**: Add missing fields to `CreateSiteData` type [[#107], [35e0e85]]
- **Core**: Add typed route registry (`ROUTES`) with `buildUrl()` and `request()` helpers [[#101], [cba90d6]]
- **Core**: Add schema-inferred `request()` overload — return type derived from Valibot schema [[#101], [97dbb91]]
- **Core**: Add `mockDocument()` / `mockListDocument()` test helpers [[#85], [5772bc4]]
- **Core**: Add `update` executor for sites [[#104], [a68eab8]]
- **Core**: Add `update` executor for daemons [[#105], [8e32116]]
- **Core**: Add `update` executor for database-users [[#106], [0ef3535]]
- **Core**: Add `update` executor for recipes [[#103], [0eb2a5c]]
- **Core**: Add `update` executor for backups [[#111], [d4aa7dd]]
- **Core**: Add `update` executor for security-rules [[#112], [3f387a8]]
- **Core**: Add support for site-scoped scheduled jobs [[#110], [e161879]]
- **CLI**: Add `forge config set organizationSlug <slug>` command [[#85], [6ca58b2]]
- **CLI**: Add `--org` flag for per-command organization override [[#85], [6ca58b2]]
- **MCP**: `forge_configure` tool now accepts `organizationSlug` parameter [[#85], [6ca58b2]]
- **MCP**: `forge_get_config` tool now shows `organizationSlug` [[#85], [6ca58b2]]

### Changed

- **All**: All API URLs now prefixed with `/orgs/{slug}` [[#85], [d755287]]
- **All**: v2 URL mapping: `/daemons` → `/background-processes`, `/databases` → `/database/schemas`, `/database-users` → `/database/users`, `/keys` → `/ssh-keys`, `/jobs` → `/scheduled-jobs`, `/backup-configs` → `/database/backups`, `/deployment-history` → `/deployments`, `/env` → `/environment` [[#85], [d755287]]
- **All**: Reduce type casts from 73 to 49 and eliminate 1 of 3 `any` usages across the codebase [[#101], [94809b9]]
- **All**: Enable strict oxlint with type-aware linting (suspicious + perf categories, 12 type-checked rules) [[#101], [2804c34]]
- **API**: Handle 202 responses with empty body (async create operations) [[#85], [4e32330]]
- **API**: Align all v2 attribute types with OpenAPI spec [[#85], [a9ce75e]]
- **Core**: `getSite` uses org-scoped path (`/orgs/{slug}/sites/{id}`) since v2 does not support GET on server-scoped site path [[#85], [28264ae]]
- **Core**: Deployments sorted by `-created_at` (v2 API defaults to oldest first) [[#85], [71b395d]]
- **Core**: 5 create executors (firewall-rules, backups, commands, redirect-rules, ssh-keys) now return void since v2 returns 202 with no body [[#85], [4e32330]]
- **Core**: Migrate all 82 executor files from manual URL construction to route registry [[#101], [4c666ce]]
- **MCP**: Replace `requiredFields` with Valibot `inputSchemas` in handler factory — validation errors now include field-level messages [[#101], [4c666ce]]
- **MCP**: Rewrite batch handler with typed `BatchOperation` interface and upfront validation [[#101], [94809b9]]
- **MCP**: Replace `any[]` return type with `Tool[]` in `getAvailableTools()` [[#101], [94809b9]]
- **MCP**: Validate `organizationSlug` early before routing to handlers [[#85], [a9ce75e]]

### Fixed

- **API**: Fix `SiteAttributesSchema` to allow null `aliases` field [[#113], [9f81d2e]]
- **Core**: Fix `getNginxConfig` to unwrap JSON:API response (was returning raw wrapper) [[#85], [fe42d56]]
- **Core**: Fix daemon restart URL — was `/restart`, now `/actions` with `{ action: "restart" }` body [[#101], [cba90d6]]
- **Core**: Fix deployment get-log — now uses correct `/deployments/:id/log` endpoint [[#101], [cba90d6]]
- **Core**: Fix deployment race condition and add log streaming [[#114], [d5e8f8f]]
- **Core**: Deduplicate deployment list fetch in `deploySiteAndWait` [[#85], [fe42d56]]
- **CLI**: Fix `deploymentsDeploy` using `formatter.success()` for failed deployments [[#85], [a9ce75e]]
- **MCP**: Fix HTTP transport reading wrong field name for `organizationSlug` [[#85], [fe42d56]]
- **MCP**: Fix unwaited `closeAll()` promises in session cleanup [[#101], [2804c34]]
- **MCP**: Fix repository display in site formatter — use `.url` property instead of stringifying object [[#101], [2804c34]]
- **All**: Fix lint warnings and deprecations [[#102], [3a07f2d]]

[#85]: https://github.com/studiometa/forge-tools/pull/85
[#101]: https://github.com/studiometa/forge-tools/pull/101
[#102]: https://github.com/studiometa/forge-tools/pull/102
[#103]: https://github.com/studiometa/forge-tools/pull/103
[#104]: https://github.com/studiometa/forge-tools/pull/104
[#105]: https://github.com/studiometa/forge-tools/pull/105
[#106]: https://github.com/studiometa/forge-tools/pull/106
[#107]: https://github.com/studiometa/forge-tools/pull/107
[#108]: https://github.com/studiometa/forge-tools/pull/108
[#110]: https://github.com/studiometa/forge-tools/pull/110
[#111]: https://github.com/studiometa/forge-tools/pull/111
[#112]: https://github.com/studiometa/forge-tools/pull/112
[#113]: https://github.com/studiometa/forge-tools/pull/113
[#114]: https://github.com/studiometa/forge-tools/pull/114
[37f4f10]: https://github.com/studiometa/forge-tools/commit/37f4f10
[b34ea27]: https://github.com/studiometa/forge-tools/commit/b34ea27
[b0f0e5b]: https://github.com/studiometa/forge-tools/commit/b0f0e5b
[015e537]: https://github.com/studiometa/forge-tools/commit/015e537
[697bae9]: https://github.com/studiometa/forge-tools/commit/697bae9
[d755287]: https://github.com/studiometa/forge-tools/commit/d755287
[7881230]: https://github.com/studiometa/forge-tools/commit/7881230
[5772bc4]: https://github.com/studiometa/forge-tools/commit/5772bc4
[6ca58b2]: https://github.com/studiometa/forge-tools/commit/6ca58b2
[0665a7e]: https://github.com/studiometa/forge-tools/commit/0665a7e
[28264ae]: https://github.com/studiometa/forge-tools/commit/28264ae
[4e32330]: https://github.com/studiometa/forge-tools/commit/4e32330
[71b395d]: https://github.com/studiometa/forge-tools/commit/71b395d
[bf661cf]: https://github.com/studiometa/forge-tools/commit/bf661cf
[a9ce75e]: https://github.com/studiometa/forge-tools/commit/a9ce75e
[fe42d56]: https://github.com/studiometa/forge-tools/commit/fe42d56
[cba90d6]: https://github.com/studiometa/forge-tools/commit/cba90d6
[4c666ce]: https://github.com/studiometa/forge-tools/commit/4c666ce
[97dbb91]: https://github.com/studiometa/forge-tools/commit/97dbb91
[ff5615b]: https://github.com/studiometa/forge-tools/commit/ff5615b
[94809b9]: https://github.com/studiometa/forge-tools/commit/94809b9
[2804c34]: https://github.com/studiometa/forge-tools/commit/2804c34
[3a07f2d]: https://github.com/studiometa/forge-tools/commit/3a07f2d
[0eb2a5c]: https://github.com/studiometa/forge-tools/commit/0eb2a5c
[8e32116]: https://github.com/studiometa/forge-tools/commit/8e32116
[0ef3535]: https://github.com/studiometa/forge-tools/commit/0ef3535
[35e0e85]: https://github.com/studiometa/forge-tools/commit/35e0e85
[441d6ae]: https://github.com/studiometa/forge-tools/commit/441d6ae
[e161879]: https://github.com/studiometa/forge-tools/commit/e161879
[d4aa7dd]: https://github.com/studiometa/forge-tools/commit/d4aa7dd
[3f387a8]: https://github.com/studiometa/forge-tools/commit/3f387a8
[9f81d2e]: https://github.com/studiometa/forge-tools/commit/9f81d2e
[d5e8f8f]: https://github.com/studiometa/forge-tools/commit/d5e8f8f
[a68eab8]: https://github.com/studiometa/forge-tools/commit/a68eab8

## 0.3.0 - 2026.02.27

### Breaking

- **CLI**: Rename binary from `forge-cli` to `forge` — all help text, usage strings, shell completions, and error messages updated [[#83], [afd4eb2]]

[#83]: https://github.com/studiometa/forge-tools/pull/83
[afd4eb2]: https://github.com/studiometa/forge-tools/commit/afd4eb2

## 0.2.5 - 2026.02.27

### Fixed

- **All packages**: Fix stale dependency resolution when installed via `npx` — inter-package `"*"` deps are now synced to exact versions before publish [[f16092c]]

[f16092c]: https://github.com/studiometa/forge-tools/commit/f16092c

## 0.2.4 - 2026.02.27

### Added

- **MCP**: Add `context` action for servers and sites — fetch resource with all related sub-resources in a single call [[#71], [c58145e]]
- **MCP**: Add `resolve` action for servers and sites — name-based lookup with partial case-insensitive matching [[#72], [56ae8a9]]
- **MCP**: Add `batch` resource with `run` action — execute up to 10 read operations in parallel with isolated error handling [[#73], [01cbf8a]]
- **MCP**: Add auto-resolve middleware — non-numeric `server_id`/`site_id` values are transparently resolved to IDs by name [[#81], [d245035]]
- **SDK**: Add `resolve()` method to `ServersCollection` and `SitesCollection` for name-based resource lookup [[#78], [9714cf5]]
- **Core**: Extract `matchByName()` utility for shared exact/partial name matching logic [[#80], [4391239]]

[#71]: https://github.com/studiometa/forge-tools/pull/71
[c58145e]: https://github.com/studiometa/forge-tools/commit/c58145e
[#72]: https://github.com/studiometa/forge-tools/pull/72
[56ae8a9]: https://github.com/studiometa/forge-tools/commit/56ae8a9
[#73]: https://github.com/studiometa/forge-tools/pull/73
[01cbf8a]: https://github.com/studiometa/forge-tools/commit/01cbf8a
[#78]: https://github.com/studiometa/forge-tools/pull/78
[9714cf5]: https://github.com/studiometa/forge-tools/commit/9714cf5
[#80]: https://github.com/studiometa/forge-tools/pull/80
[4391239]: https://github.com/studiometa/forge-tools/commit/4391239
[#81]: https://github.com/studiometa/forge-tools/pull/81
[d245035]: https://github.com/studiometa/forge-tools/commit/d245035

## 0.2.3 - 2026.02.27

### Added

- **MCP**: Add OAuth 2.1 with PKCE support for Claude Desktop compatibility — stateless design using AES-256-GCM encrypted tokens, no server-side storage required [[#67], [4200898]]
- **MCP**: Add `/.well-known/oauth-authorization-server` (RFC 8414), `/.well-known/oauth-protected-resource` (RFC 9728), `/register` (RFC 7591), `/authorize`, `/token` endpoints [[#67], [4200898]]
- **MCP**: Add `WWW-Authenticate` header on 401 responses pointing to protected resource metadata [[#67], [4200898]]
- **MCP**: Add `OAUTH_SECRET` env var for AES-256-GCM encryption key [[#67], [4200898]]
- **MCP**: Support base64-encoded OAuth access tokens in `parseAuthHeader` (backwards compatible with raw tokens) [[#67], [4200898]]

[#67]: https://github.com/studiometa/forge-tools/pull/67
[4200898]: https://github.com/studiometa/forge-tools/commit/4200898

## 0.2.2 - 2026.02.27

### Fixed

- **MCP**: Make dist entry points executable so npx can invoke them directly [[#65], [c4391f5]]

[#65]: https://github.com/studiometa/forge-tools/pull/65
[c4391f5]: https://github.com/studiometa/forge-tools/commit/c4391f5

## 0.2.1 - 2026.02.27

### Fixed

- **MCP**: Fix server not starting when invoked as `node dist/index.js` instead of via `.bin/forge-mcp` symlink [[#64], [2593508]]

[#64]: https://github.com/studiometa/forge-tools/pull/64
[2593508]: https://github.com/studiometa/forge-tools/commit/2593508

## 0.2.0 - 2026.02.27

### Added

- **MCP**: Split `forge` tool into `forge` (read-only) and `forge_write` (write) with MCP annotations for auto-approval [[#55], [51f3aed]]
- **MCP**: Add `--read-only` flag to MCP server — disables `forge_write` tool entirely [[#58], [9a3732c]]
- **MCP**: Add top-level `title`, `outputSchema`, and `structuredContent` to all tools per MCP SDK best practices [[#62], [8e29993]]
- **MCP**: Use SDK `Tool` type instead of local interface for type safety [[#62], [8e29993]]
- **Core**: Add pino audit logging for write operations (MCP + CLI), configurable via `FORGE_AUDIT_LOG` env var [[#56], [a11ba9b]]
- **Core**: Add `deploySiteAndWait` executor — polls deployment status and returns log on completion [[#59], [94f069f]]
- **Core**: Add `getDeploymentLog` executor for fetching latest deployment log [[#59], [94f069f]]
- **CLI**: Add `completion` command with bash, zsh, and fish shell completion scripts [[#60], [5ab4fe0]]

### Changed

- **MCP**: `deploy` action now blocks until deployment completes and returns the deployment log [[#59], [94f069f]]
- **CLI**: `deployments deploy` now shows live progress and prints deployment log on completion [[#59], [94f069f]]

### Breaking

- **MCP**: The single `forge` tool is now split into `forge` (read) and `forge_write` (write). Clients calling `forge` with write actions (`create`, `delete`, `deploy`, etc.) must switch to `forge_write`. [[#55], [51f3aed]]

[#55]: https://github.com/studiometa/forge-tools/pull/55
[#56]: https://github.com/studiometa/forge-tools/pull/56
[#58]: https://github.com/studiometa/forge-tools/pull/58
[#59]: https://github.com/studiometa/forge-tools/pull/59
[#60]: https://github.com/studiometa/forge-tools/pull/60
[#62]: https://github.com/studiometa/forge-tools/pull/62
[51f3aed]: https://github.com/studiometa/forge-tools/commit/51f3aed
[9a3732c]: https://github.com/studiometa/forge-tools/commit/9a3732c
[a11ba9b]: https://github.com/studiometa/forge-tools/commit/a11ba9b
[5ab4fe0]: https://github.com/studiometa/forge-tools/commit/5ab4fe0
[94f069f]: https://github.com/studiometa/forge-tools/commit/94f069f
[8e29993]: https://github.com/studiometa/forge-tools/commit/8e29993

## v0.1.0 - 2026.02.26

### Added

- **API** (`@studiometa/forge-api`):
  - HttpClient with auth headers, rate limiting (60 req/min sliding window), exponential backoff on 429
  - ForgeApiError with status, statusText, url, body
  - RateLimiter (sliding window implementation)
  - ConfigStore (XDG-compliant JSON storage)
  - Token management: getToken, setToken, deleteToken (env var > config file)
  - TypeScript types for all Forge resources: servers, sites, deployments, certificates, databases, daemons, backups, commands, scheduled jobs, firewall rules, SSH keys, security rules, redirect rules, monitors, nginx templates, recipes
  - Response wrapper types for all resources

- **SDK** (`@studiometa/forge-sdk`):
  - Fluent chainable API: `forge.server(id).site(id).deploy()`
  - ServersCollection/ServerResource with nested site/database/daemon access
  - SitesCollection/SiteResource with env, nginx, deployments, certificates
  - DeploymentsCollection (list, output, script, updateScript)
  - CertificatesCollection (list, get, create, delete, letsEncrypt, activate)
  - DatabasesCollection (list, get, create, delete)
  - DaemonsCollection (list, get, create, delete, restart)
  - Dependency injection via fetch option for testing
  - Add `createMockFetch()` test utility for SDK unit tests [[#24], [0af82b6]]
  - Add `BaseCollection` abstract class; extend all SDK resource classes with it [[#25], [1f3c637]]
  - Add `AsyncPaginatedIterator` and `all()` async iterator methods to collections [[#26], [1fc9788]]
  - Add missing resource collections: backups, commands, scheduled-jobs, monitors, firewall-rules, ssh-keys, security-rules, redirect-rules, nginx-templates, recipes [[#41], [308d9f7]]

- **Core** (`@studiometa/forge-core`):
  - ExecutorContext with DI for testability
  - createTestExecutorContext() with proxy client
  - RESOURCES and ACTIONS constants (single source of truth)
  - 59 executor functions across 15 resource groups:
    - Servers: list, get, create, delete, reboot
    - Sites: list, get, create, delete
    - Deployments: list, deploy, getOutput, getScript, updateScript
    - Certificates: list, get, create, delete, activate
    - Databases: list, get, create, delete
    - Daemons: list, get, create, delete, restart
    - Firewall Rules: list, get, create, delete
    - SSH Keys: list, get, create, delete
    - Security Rules: list, get, create, delete
    - Redirect Rules: list, get, create, delete
    - Monitors: list, get, create, delete
    - Nginx Templates: list, get, create, update, delete
    - Recipes: list, get, create, delete, run
  - Add typed options interfaces per executor (`types.ts` per resource folder) [[#31], [453c9fd]]
  - Move text formatting out of executors into the MCP layer [[#30], [ef97aa6]]
  - Add database-users executors (list, get, create, delete, update-password) [[#40], [191271f]]

- **MCP** (`@studiometa/forge-mcp`):
  - Stdio transport with MCP SDK integration
  - Single unified `forge` tool with resource/action routing
  - Stdio-only tools: forge_configure, forge_get_config
  - Handlers for all 15 resources + env + nginx config
  - createResourceHandler() factory for DRY handler creation
  - Help system: per-resource docs with actions, fields, examples
  - Schema system: compact machine-readable specs for LLM consumption
  - Hints system: contextual suggestions after get actions
  - Instructions loaded from SKILL.md for MCP client initialization
  - Pi skill (SKILL.md) with full resource reference and workflow examples
  - Add `UserInputError` class and `ErrorMessages` constants [[#27], [c45f7a4]]
  - Add HTTP transport (h3) alongside existing stdio transport [[#29], [9858b48]]
  - Replace custom HTTP transport with official MCP Streamable HTTP transport (protocol 2025-03-26) [[#47], [ee55bfe]]
  - Add `SessionManager` with TTL-based cleanup for multi-tenant session management [[#47], [ee55bfe]]
  - Wire contextual hints end-to-end in `HandlerContext` and `createResourceHandler` [[#32], [7499b1a]]
  - Add database-users MCP handler [[#40], [191271f]]

- **MCP** (fixes):
  - Fix compact output defaulting logic to use per-action default [[#28], [52bece0]]

- **CLI** (`@studiometa/forge-cli`):
  - Add `forge-cli` package — full command-line interface for managing Laravel Forge resources [[#33], [47826e1]]
  - Add `forge-cli` to root README and create `packages/cli/README.md` [[#39], [a4a43f5]]
  - Add CLI commands for backups, commands, scheduled-jobs, user, monitors, nginx-templates, security-rules, redirect-rules [[#42], [9865cd7]]
  - Add database-users CLI commands [[#40], [191271f]]
  - Add smart `--server` and `--site` resolution by name or partial match [[#48], [131275c]]
  - Add `OutputFormatter` with `outputList()`, `outputOne()`, `isJson()` for human/table/json output [[#50], [04468e9]]

- **Infrastructure**:
  - Monorepo with npm workspaces (api → sdk → core → mcp)
  - Vite build with node18 target
  - Vitest with coverage thresholds
  - TypeScript strict mode
  - oxlint + oxfmt (Rust-based linting/formatting)
  - husky + lint-staged pre-commit hooks
  - Renovate bot configuration
  - CI workflow: lint, build, typecheck, test+coverage, semgrep
  - Publish workflow: npm publish with provenance on tag push
  - Documentation: README.md, CONTRIBUTING.md, CLAUDE.md, package READMEs

[#24]: https://github.com/studiometa/forge-tools/pull/24
[#25]: https://github.com/studiometa/forge-tools/pull/25
[#26]: https://github.com/studiometa/forge-tools/pull/26
[#27]: https://github.com/studiometa/forge-tools/pull/27
[#28]: https://github.com/studiometa/forge-tools/pull/28
[#29]: https://github.com/studiometa/forge-tools/pull/29
[#30]: https://github.com/studiometa/forge-tools/pull/30
[#31]: https://github.com/studiometa/forge-tools/pull/31
[#32]: https://github.com/studiometa/forge-tools/pull/32
[#33]: https://github.com/studiometa/forge-tools/pull/33
[#39]: https://github.com/studiometa/forge-tools/pull/39
[#40]: https://github.com/studiometa/forge-tools/pull/40
[#41]: https://github.com/studiometa/forge-tools/pull/41
[#42]: https://github.com/studiometa/forge-tools/pull/42
[#47]: https://github.com/studiometa/forge-tools/pull/47
[0af82b6]: https://github.com/studiometa/forge-tools/commit/0af82b6
[1f3c637]: https://github.com/studiometa/forge-tools/commit/1f3c637
[1fc9788]: https://github.com/studiometa/forge-tools/commit/1fc9788
[308d9f7]: https://github.com/studiometa/forge-tools/commit/308d9f7
[453c9fd]: https://github.com/studiometa/forge-tools/commit/453c9fd
[ef97aa6]: https://github.com/studiometa/forge-tools/commit/ef97aa6
[191271f]: https://github.com/studiometa/forge-tools/commit/191271f
[c45f7a4]: https://github.com/studiometa/forge-tools/commit/c45f7a4
[9858b48]: https://github.com/studiometa/forge-tools/commit/9858b48
[7499b1a]: https://github.com/studiometa/forge-tools/commit/7499b1a
[52bece0]: https://github.com/studiometa/forge-tools/commit/52bece0
[47826e1]: https://github.com/studiometa/forge-tools/commit/47826e1
[a4a43f5]: https://github.com/studiometa/forge-tools/commit/a4a43f5
[9865cd7]: https://github.com/studiometa/forge-tools/commit/9865cd7
[ee55bfe]: https://github.com/studiometa/forge-tools/commit/ee55bfe
[#48]: https://github.com/studiometa/forge-tools/pull/48
[#50]: https://github.com/studiometa/forge-tools/pull/50
[131275c]: https://github.com/studiometa/forge-tools/commit/131275c
[04468e9]: https://github.com/studiometa/forge-tools/commit/04468e9
