# Changelog

Tous les changements notables de ce projet sont documentés dans ce fichier.

Le format est basé sur [Keep a Changelog](https://keepachangelog.com/fr/).

## Non publié

### Ajouté

- **API**: HttpClient with auth, rate limiting (60 req/min), retry on 429, ForgeApiError, ConfigStore (XDG), types for all Forge resources
- **SDK**: Fluent chainable API — `forge.server(id).site(id).deploy()`, servers, sites, deployments, certificates, databases, daemons
- **Core**: Pure executor functions with DI — listServers, getServer, createServer, rebootServer, deleteServer, listSites, getSite, createSite, deleteSite, listDeployments, deploySite, getDeploymentOutput, getDeploymentScript, updateDeploymentScript
- **MCP**: Stdio transport with single `forge` tool (resource/action routing), `forge_configure`/`forge_get_config` tools, handlers for servers/sites/deployments, help system
- CI/CD: GitHub Actions (lint, build, typecheck, test, semgrep, publish)
- Monorepo scaffolding: Vite, Vitest, TypeScript, oxlint, oxfmt, husky, lint-staged
- Documentation: CLAUDE.md, CONTRIBUTING.md, README.md, package READMEs
