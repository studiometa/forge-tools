# Contributing

Thank you for your interest in contributing to Laravel Forge Tools!

## Getting Started

```bash
git clone https://github.com/studiometa/forge-tools.git
cd forge-tools
npm install
npm run build
```

## Development

### Workspace Commands

```bash
npm run build          # Build all packages (in dependency order)
npm run test           # Run all tests
npm run test:watch     # Watch mode
npm run typecheck      # Type check all packages
npm run lint           # Lint with oxlint
npm run format         # Format with oxfmt
npm run clean          # Remove dist/ and node_modules/
```

### Working on a Specific Package

```bash
npm run build -w @studiometa/forge-api
npm run test -w @studiometa/forge-sdk
npm run dev -w @studiometa/forge-mcp
```

### Package Dependency Order

Build order matters — packages depend on each other:

```
forge-api → forge-sdk
forge-api → forge-core → forge-mcp
                       → forge-cli
```

The root `npm run build` handles this automatically.

## Project Structure

```
forge-tools/
├── packages/
│   ├── api/       # @studiometa/forge-api — HTTP client, types, config, rate limiter
│   ├── sdk/       # @studiometa/forge-sdk — fluent chainable TypeScript SDK
│   ├── core/      # @studiometa/forge-core — executor functions with DI
│   ├── mcp/       # @studiometa/forge-mcp — MCP server (stdio + HTTP)
│   └── cli/       # @studiometa/forge-cli — CLI for humans and AI agents
├── CHANGELOG.md   # Single changelog for the entire monorepo
├── CLAUDE.md      # AI agent instructions
└── package.json   # Root workspace config
```

## Code Style

- **Zero runtime dependencies** in forge-api — use native Node.js APIs
- **TypeScript** — all code must be properly typed
- **ESM only** — no CommonJS
- **Functional style** — prefer pure functions, inject dependencies via context
- **oxlint + oxfmt** — run `npm run lint` and `npm run format` before committing

## Testing

All packages use Vitest:

```bash
npm run test              # Run once
npm run test:watch        # Watch mode
npm run test:ci           # With coverage
```

Use dependency injection for mocking. The `@studiometa/forge-core` package provides `createTestExecutorContext()` for easy test setup.

## Commit Messages

Use simple English imperative sentences:

```
Add the X component
Fix the Y bug
Update dependencies
```

Always add the co-author trailer when AI-assisted:

```
Co-authored-by: Claude <claude@anthropic.com>
```

## Versioning

All packages share one version. Each merge into `main` releases with the `Release` workflow (`publish.yml`): after the tests, it folds the changelog fragments into `CHANGELOG.md`, bumps the version, tags, creates the GitHub release and publishes to npm. Without a fragment, nothing is released.

The version follows the fragments: on 0.x, a breaking entry gives a minor version and any other entry a patch version. Maintainers can force a bump with a manual run:

```bash
gh workflow run publish.yml -f version=minor   # or patch / major
```

To release prereleases, add a `.changelog/prerelease` file with one identifier (`alpha`, `beta` or `rc`): the next merges release prereleases such as `0.4.8-beta.0`, then `0.4.8-beta.1`. Remove the file to release the stable version. A prerelease goes to the `next` dist-tag on npm and is marked as a prerelease on GitHub. Any other version goes to `latest`. See [prereleases](https://github.com/weareikko/changelog#prereleases).

Publishing uses npm trusted publishing (OIDC), so the workflow has no npm token. Each package has its own publish step, which skips a version that npm already has. When a publish fails, use "Re-run failed jobs" on the run: the packages already published are skipped and the others are published.

## Changelog

Do not edit `CHANGELOG.md`. Add a fragment in `.changelog/<slug>.md`, where the slug is your branch name without its prefix. Use `###` Keep a Changelog sections and prefix entries with the package name when relevant:

```markdown
### Added

- **SDK**: Add support for databases

### Fixed

- **MCP**: Fix OAuth token refresh
```

Do not write the pull request number: the release adds it. A pull request that changes `packages/` needs a fragment, unless it has the `no-changelog` label. See [`weareikko/changelog`](https://github.com/weareikko/changelog) for the format.

## Pull Request Process

1. Create a feature branch
2. Make changes and add tests
3. Run checks: `npm run typecheck && npm run lint && npm test && npm run build`
4. Add a fragment in `.changelog/`
5. Open a pull request with a clear description

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
