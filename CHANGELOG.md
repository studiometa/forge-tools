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
