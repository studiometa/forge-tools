### Added

- **CLI**: Add `forge deployments script` and `forge deployments update-script` (`--file <path|->` or `--content`) to read and write a site's deployment script, and `--script-file <path>` on `forge deployments deploy` to upload the script before deploying [[#127]]

### Changed

- **CLI**: Accept a lone dash (`-`) as an option value for all commands, so `--file -` reads stdin; before, `-` parsed as a boolean flag [[#127]]

[#127]: https://github.com/studiometa/forge-tools/pull/127
