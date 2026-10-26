### Fixed

- **Core/SDK/MCP/CLI**: Send the site Nginx configuration as `config` in the update request body, as the Forge API requires, so `forge nginx update` and the MCP `nginx` update no longer fail with "The config field is required"
- **Core/SDK/MCP/CLI**: Send the site environment as `environment` in the update request body, as the Forge API requires
- **API/Core/MCP/CLI**: Accept the boolean `auto_source` that the Forge API returns for a deployment script, so `forge deployments script`, `forge deployments update-script --check` and the MCP `deployments` get no longer fail with "Invalid type: Expected string but received false"
- **CLI**: Print the content of `forge nginx get`, `forge env get` and `forge php config` as it is, with no second trailing newline, so the output round-trips with `--file` and `--check` without drift
