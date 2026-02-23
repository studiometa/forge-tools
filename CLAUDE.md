# Claude Instructions

Instructions for AI agents contributing to this codebase.

## Git & Commits

- Commit messages: **English**, imperative mood (Add, Fix, Update...)
- No conventional commit prefixes (feat:, fix:, etc.)
- Always add `Co-authored-by: Claude <claude@anthropic.com>` trailer
- **Tags**: Do NOT use `v` prefix (use `0.1.0` not `v0.1.0`)
- **Releases**: Do NOT create GitHub releases manually — they are created automatically by GitHub Actions when a tag is pushed
- **Never use `git add .`** — always stage specific files

## Changelog

- **Single changelog** at root (`CHANGELOG.md`) for the entire monorepo
- Prefix entries with package name when relevant: `**SDK**: ...`, `**API**: ...`, `**Core**: ...`, `**MCP**: ...`
- Use `[hash]` format for commit references (not bare hashes)
- Use `[#N]` format for PR references (GitHub style)
- Add link definitions at the end of each release section
- Keep entries concise, single line with references at the end
- Use English imperative: Add, Fix, Update, Remove

## Versioning

- Use root npm scripts to bump version across all packages:
  - `npm run version:patch` — bump patch
  - `npm run version:minor` — bump minor
  - `npm run version:major` — bump major
- All 4 packages share the same version
- Version is injected at build time from package.json via `versionDefine()`

## Architecture

4-package monorepo with clean dependency layering:

```
forge-api   → (nothing)       # HTTP client, types, config, rate limiter
forge-sdk   → forge-api       # PUBLIC: fluent chainable SDK (the hero package)
forge-core  → forge-api       # Executors with DI for MCP
forge-mcp   → forge-core      # MCP server (stdio transport)
            → forge-api
```

### Package Responsibilities

- **forge-api** (`packages/api`): `HttpClient` class (internal), TypeScript types for all Forge resources, `ForgeApiError`, `RateLimiter` (60 req/min sliding window + exponential backoff), `ConfigStore` (XDG-compliant config storage). Zero runtime dependencies. Node 18+ target (wide adoption).
- **forge-sdk** (`packages/sdk`): `Forge` class with fluent chainable API (`forge.servers(123).sites(456).deploy()`). Thin wrapper over forge-api — delegates all HTTP. JSDoc on every public method. The hero package with standalone README.
- **forge-core** (`packages/core`): Pure executor functions `(options, context) → ExecutorResult<T>`, `ExecutorContext` with DI, centralized constants (`RESOURCES`, `ACTIONS`). Same pattern as productive-core.
- **forge-mcp** (`packages/mcp`): Single unified `forge` MCP tool with `resource` + `action` routing, `createResourceHandler()` factory, stdio transport for local use.

### Key Design Principles

- **Executors are pure functions** — all dependencies injected via `ExecutorContext`
- **DI over mocking** — injectable `fetch`, `createTestExecutorContext()`
- **SDK is a thin fluent layer** — no HTTP logic, just delegates to forge-api
- **Centralized constants** — single source of truth for resources and actions
- **Zero runtime dependencies** in forge-api (the SDK has forge-api as its only dep)
- **Forge API returns plain JSON** (not JSON:API) — simpler than Productive
- **Rate limit: 60 req/min** (not 100/10s like Productive)

### Config Storage

| Platform | Path                                                    |
| -------- | ------------------------------------------------------- |
| Linux    | `~/.config/forge-tools/config.json`                     |
| macOS    | `~/Library/Application Support/forge-tools/config.json` |
| Windows  | `%APPDATA%/forge-tools/config.json`                     |

Resolution priority: `FORGE_API_TOKEN` env var > config file.

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
npm run version:patch      # Bump patch version across all packages
```

## Adding a New Resource (step-by-step)

### 1. API Types & Client (`forge-api`)

- Add types in `packages/api/src/types.ts`
- Add client methods if needed
- Add tests

### 2. SDK Resource Builders (`forge-sdk`)

- Add Collection + Resource classes in `packages/sdk/src/resources/`
- Wire into `Forge` class
- Add JSDoc with `@example` tags
- Add tests with mock fetch

### 3. Executors (`forge-core`)

- Add to `packages/core/src/constants.ts` (RESOURCES, ACTIONS)
- Create `packages/core/src/executors/<resource>/` with list, get, create, etc.
- Export from `packages/core/src/index.ts`
- Add tests using `createTestExecutorContext()`

### 4. MCP Handler (`forge-mcp`)

- Use `createResourceHandler()` factory
- Wire in handler routing
- Add tests

### 5. Build & Test

```bash
npm run build
npm run test
```
