### Added

- **MCP**: Add a read-only `check` action on the `forge` tool for `env`, `nginx`, `deployments` (deployment script) and `php` (`setting: "config"`) that compares `content` with Forge without writing and returns `{ inSync, diff }`; for `env` the diff holds variable names only (`added`, `removed`, `changed`), never values
- **Core**: Add pure drift functions (`compareText`, `compareEnv`, `unifiedDiff`, `normalizeContent`, `diffEnv`, `formatEnvDiff`) and the `check` action constant

### Changed

- **MCP**: Require Node.js 24 or later, the same as Core and the CLI
- **MCP**: List all read actions in the batch error message, and document the `compact` default and the PHP fields for `check` in the tool schema
- **CLI**: Use the drift functions from Core for `--check`; the output does not change
