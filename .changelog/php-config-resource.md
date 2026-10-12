### Added

- **Core/SDK/MCP/CLI**: Add a server-scoped `php` resource to list installed PHP versions, read and replace the cli, fpm and pool configuration files, get and set the max upload size and max execution time, and get, enable or disable OPcache; Core, MCP and CLI resolve versions from an ID or a version such as `8.3` or `php83`, the SDK takes the version ID [[#131]]
- **CLI**: Add `forge php` commands (`list`, `config`, `update-config`, `max-upload-size`, `set-max-upload-size`, `max-execution-time`, `set-max-execution-time`, `opcache`, `enable-opcache`, `disable-opcache`); `update-config` takes `--file <path|->` or `--content` and supports `--check` [[#131]]

### Changed

- **CLI**: Print the CLI version only for `forge --version` or `forge -v` with no command; after a command, `--version` is the command option, so a missing value fails validation instead of printing the version [[#131]]

[#131]: https://github.com/studiometa/forge-tools/pull/131
