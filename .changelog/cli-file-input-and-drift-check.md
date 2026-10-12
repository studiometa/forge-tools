### Added

- **CLI**: Add `--file <path|->` to `forge env update` and `forge nginx update` as an alternative to `--content`, with the same rules as `update-script` (exactly one source, no empty content) [[#128]]
- **CLI**: Add `--check` to `forge deployments update-script`, `forge env update` and `forge nginx update` to compare the local content with Forge without writing: exit 0 when in sync, exit 1 with a line diff (env: variable names only, never values) [[#128]]

[#128]: https://github.com/studiometa/forge-tools/pull/128
