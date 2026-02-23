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
```

The root `npm run build` handles this automatically.

## Project Structure

```
forge-tools/
├── packages/
│   ├── api/       # @studiometa/forge-api — HTTP client, types, config, rate limiter
│   ├── sdk/       # @studiometa/forge-sdk — fluent chainable TypeScript SDK
│   ├── core/      # @studiometa/forge-core — executor functions with DI
│   └── mcp/       # @studiometa/forge-mcp — MCP server (stdio + HTTP)
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

Use simple French imperative sentences:

```
Ajoute le composant X
Corrige le bug Y
Met à jour les dépendances
```

Always add the co-author trailer:

```
Co-authored-by: Claude <claude@anthropic.com>
```

## Versioning

Version is managed at the root level and synced across all packages:

```bash
npm run version:patch    # 0.1.0 → 0.1.1
npm run version:minor    # 0.1.0 → 0.2.0
npm run version:major    # 0.1.0 → 1.0.0
```

## Changelog

A single `CHANGELOG.md` at the root covers all packages. Prefix entries with the package name when relevant:

```markdown
## 0.2.0

- **SDK**: Ajoute le support des databases
- **MCP**: Corrige le rafraîchissement OAuth
- **Core**: Ajoute les executors reports
```

## Pull Request Process

1. Create a feature branch
2. Make changes and add tests
3. Run checks: `npm run typecheck && npm run lint && npm test && npm run build`
4. Update `CHANGELOG.md`
5. Open a pull request with a clear description

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
