# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## Unreleased

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
