### Added

- **CLI**: Add `forge ssh-keys sync --file <path|->` to make the SSH keys of a server user match an `authorized_keys` file on `--server` targets or `--all-servers`, with `--user`, `--prune` and `--dry-run` [[#130]]

### Changed

- **CLI**: Collect a repeated `--server` option into an array (`--server 1 --server 2`); other options keep the last value [[#130]]

### Fixed

- **Core**: Read every page in `listServers` and `listSshKeys`, so lists with more than 30 items are complete, and add a `user` filter to `listSshKeys` [[#130]]

[#130]: https://github.com/studiometa/forge-tools/pull/130
