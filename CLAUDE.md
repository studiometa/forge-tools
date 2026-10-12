# Claude Instructions

Instructions for AI agents contributing to this codebase.

## Git & Commits

- Commit messages: **English**, imperative mood (Add, Fix, Update...)
- No conventional commit prefixes (feat:, fix:, etc.)
- Always add `Co-authored-by: Claude <claude@anthropic.com>` trailer
- **Releases**: Do NOT tag or create GitHub releases manually — run the `Release` workflow (see Versioning)
- **Never use `git add .`** — always stage specific files

## Changelog

- **Never edit `CHANGELOG.md` directly.** Each PR adds a fragment `.changelog/<slug>.md` (slug = branch name without its prefix, e.g. `feature/ssh-sync` → `ssh-sync.md`)
- A fragment only contains `### Added|Changed|Deprecated|Removed|Fixed|Security|Dependencies` headings, each followed by its entries — no `#`/`##` heading
- **Do not write the PR number**: the `Release` workflow appends `[[#N]]` and the link definition from the merged PR that added the fragment
- Prefix entries with package name when relevant: `**SDK**: ...`, `**API**: ...`, `**Core**: ...`, `**MCP**: ...`, `**CLI**: ...`
- Commit references are optional: `[hash]` in the entry plus its `[hash]: https://github.com/studiometa/forge-tools/commit/hash` link definition in the fragment
- Keep entries concise, single line
- Use English imperative: Add, Fix, Update, Remove
- The `Changelog` check fails when a PR changes `packages/**` without a fragment; set the `no-changelog` label for changes users do not see (tests, refactors, tooling)
- Format and tooling: [`weareikko/changelog`](https://github.com/weareikko/changelog)

## Versioning

- Release with the `Release` workflow in `publish.yml`: `gh workflow run publish.yml -f bump=patch` (or `minor` / `major`). It bumps all packages with `npm version --workspaces --include-workspace-root`, folds `.changelog/` into `CHANGELOG.md`, commits `Release <version>`, tags (no `v` prefix), then publishes to npm and creates the GitHub release
- Prereleases: `gh workflow run publish.yml -f bump=prerelease -f preid=beta` (or `prepatch` / `preminor` / `premajor`, `preid` is `alpha`, `beta` or `rc`). A version with a `-` goes to the `next` dist-tag on npm and is a GitHub prerelease; any other version goes to `latest`. To promote a prerelease, use `bump=patch` (from `0.5.0-rc.1` it gives `0.5.0`): this release can have no fragment: its GitHub release body is `Stable release of <prerelease>.`
- Publishing can run again: each package has its own `JS-DevTools/npm-publish` step, which skips a version that npm already has. After a failed publish, use "Re-run failed jobs", or `gh workflow run publish.yml -f tag=<version>` to publish an existing tag
- npm trusted publishing (OIDC, no npm token) is configured for `publish.yml`: keep the release and publish jobs in that file, never call them from another workflow
- All 5 packages share the same version
- Version is injected at build time from package.json via `versionDefine()`

## Architecture

5-package monorepo with clean dependency layering:

```
forge-api   → (nothing)       # HTTP client, types, config, rate limiter
forge-sdk   → forge-api       # PUBLIC: fluent chainable SDK (the hero package)
forge-core  → forge-api       # Executors with DI for MCP and CLI
forge-mcp   → forge-core      # MCP server (stdio transport)
            → forge-api
forge-cli   → forge-core      # CLI tool (human + AI agent use)
            → forge-api
```

### Package Responsibilities

- **forge-api** (`packages/api`): `HttpClient` class (internal), TypeScript types for all Forge resources (JSON:API generic types + v2 attribute types), `ForgeApiError`, `RateLimiter` (60 req/min sliding window + exponential backoff), `ConfigStore` (XDG-compliant config storage), JSON:API unwrapping helpers (`unwrapDocument`, `unwrapListDocument`). Zero runtime dependencies. Node 18+ target.
- **forge-sdk** (`packages/sdk`): `Forge` class with fluent chainable API (`forge.server(123).site(456).deploy()`). Constructor takes `(token, organizationSlug, options?)`. Thin wrapper over forge-api with cursor-based pagination. JSDoc on every public method.
- **forge-core** (`packages/core`): Pure executor functions `(options, context) → ExecutorResult<T>`, `ExecutorContext` with DI (includes `organizationSlug`), typed route registry (`ROUTES`) with `buildUrl()` and `request()` helpers, centralized constants (`RESOURCES`, `ACTIONS`). Includes `matchByName` helper for auto-resolving resource names to numeric IDs.
- **forge-mcp** (`packages/mcp`): Two MCP tools — `forge` (read-only: `list`, `get`, `resolve`, `context`, `help`, `schema`) and `forge_write` (destructive: `create`, `update`, `delete`, `deploy`, `reboot`, `restart`, `activate`, `run`) with `resource` + `action` routing, `createResourceHandler()` factory, stdio and HTTP transports. Supports `batch` resource for multi-action calls. Auto-resolve middleware translates name strings to numeric IDs before dispatching. Reads `organizationSlug` from config.
- **forge-cli** (`packages/cli`): CLI tool for managing Forge servers, sites, and more. Binary is `forge`. Human-friendly output by default, `--format json` for scripting and AI agent use.

### Key Design Principles

- **Executors are pure functions** — all dependencies injected via `ExecutorContext`
- **DI over mocking** — injectable `fetch`, `createTestExecutorContext()`
- **SDK is a thin fluent layer** — no HTTP logic, just delegates to forge-api
- **Centralized constants** — single source of truth for resources and actions
- **Zero runtime dependencies** in forge-api (the SDK has forge-api as its only dep)
- **JSON:API responses** — v2 API returns `{ data: { id, type, attributes } }`, unwrapped via helpers
- **Organization-scoped URLs** — all API calls prefixed with `/orgs/{slug}` via `orgPrefix(ctx)`
- **Rate limit: 60 req/min** (same as Productive)

### Config Storage

| Platform | Path                                                    |
| -------- | ------------------------------------------------------- |
| Linux    | `~/.config/forge-tools/config.json`                     |
| macOS    | `~/Library/Application Support/forge-tools/config.json` |
| Windows  | `%APPDATA%/forge-tools/config.json`                     |

Resolution priority: `FORGE_API_TOKEN` env var > config file.

Config fields:

- `apiToken` — Forge API token (scoped, from Forge dashboard)
- `organizationSlug` — Default organization slug (e.g. `studio-meta`), also via `FORGE_ORG` env var

## Testing Rules

Mandatory for all code:

1. **Each package must approach 100% coverage.** Every source file needs corresponding tests.
2. **DI over mocking.** Use `createTestExecutorContext()` in core. Use injected `fetch` in api/sdk. Only use `vi.mock()` for Node.js built-ins (`node:fs`, `node:os`).
3. **File system operations must be mocked.** Never read/write real user files in tests.
4. **Colocated tests:** `foo.ts` → `foo.test.ts` in the same directory.
5. **No real API calls in tests.** All HTTP requests mocked via DI.
6. **Vitest configuration:** Root `vitest.config.ts` uses `projects: ['packages/*']`.

## Common Scripts

```bash
npm run build              # Build all packages (respects dependency order)
npm run test               # Unit tests (all packages via Vitest projects)
npm run lint               # oxlint
npm run lint:fix           # oxlint --fix
npm run format             # oxfmt --write
npm run format:check       # oxfmt --check
npm run typecheck          # TypeScript check (all workspaces)
npm run semgrep            # Security/quality scan
```

## Adding a New Resource (step-by-step)

### 1. API Types (`forge-api`)

- Add attribute types in `packages/api/src/types/attributes.ts`
- Export from `packages/api/src/index.ts`
- No client changes needed (generic `HttpClient.get<JsonApiDocument<T>>()`)

### 2. Executors (`forge-core`)

- Add to `packages/core/src/constants.ts` (RESOURCES, ACTIONS)
- Add route definition to `packages/core/src/routes.ts` (ROUTES registry)
- Create `packages/core/src/executors/<resource>/` with list, get, create, etc.
- Use `request(route, ctx, params)` for API calls — return type inferred from Valibot schema
- Export from `packages/core/src/index.ts`
- Add tests using `createTestExecutorContext({ organizationSlug: "test-org" })` and `mockDocument()` / `mockListDocument()` helpers

### 3. SDK Resource Builders (`forge-sdk`)

- Add Collection + Resource classes in `packages/sdk/src/resources/`
- Wire into `Forge` class, pass `orgSlug` to collection
- Add JSDoc with `@example` tags
- Add tests with mock fetch returning JSON:API format

### 4. MCP Handler (`forge-mcp`)

- Use `createResourceHandler()` factory
- Wire in handler routing
- Add formatter functions for compact output
- Add tests

### 5. Build & Test

```bash
npm run build
npm run test
```
