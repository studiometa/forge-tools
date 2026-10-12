### Added

- **MCP**: Add a read-only `check` action on the `forge` tool for `env`, `nginx`, `deployments` (deployment script) and `php` (`setting: "config"`) that compares `content` with Forge without writing and returns `{ inSync, diff }`; for `env` the diff holds variable names only (`added`, `removed`, `changed`), never values
- **Core**: Add pure drift functions (`compareText`, `compareEnv`, `unifiedDiff`, `normalizeContent`, `diffEnv`, `formatEnvDiff`) and the `check` action constant

### Changed

- **CLI**: Use the drift functions from Core for `--check`; the output does not change
