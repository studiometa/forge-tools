### Added

- **API/Core/SDK/MCP**: Add an organization-scoped `storage-providers` resource to list, get, create and delete the storage providers of database backups (`s3`, `spaces`, `hetzner`, `ovh`, `scaleway` or `custom` S3-compatible)
- **CLI**: Add `forge storage-providers` (`list`, `get`, `create`, `delete`); `create` reads the secret key from `--secret-key-file <path|->` only, so it does not show in the shell history
- **CLI**: Add `--retention`, `--time`, `--day`, `--cron`, `--bucket`, `--directory`, `--name`, `--notification-email` and `--include-new-databases` to `forge backups create`
- **API/MCP**: Accept `include_new_databases` when creating a backup configuration

### Changed

- **CLI**: Breaking: rename the `--provider` option of `forge backups create` and `forge backups update` to `--storage-provider`, which takes a storage provider ID or exact name
- **CLI**: Require `--databases` on `forge backups create` and `forge backups update`, and accept database IDs or exact names, comma separated or repeated
- **CLI**: Default `forge backups create` to a retention of 5 backups only when `--retention` is not given, and check `--frequency` and `--retention` before calling Forge
- **Core**: Redact `access_key` and `secret_key` in the audit log

### Fixed

- **CLI**: Send every ID of a comma-separated `--databases` list in `forge backups create` and `forge backups update`, instead of `NaN`
- **MCP**: Validate `backups` create with the fields the Forge API takes (`storage_provider_id`, `frequency`, `retention`, `database_ids`) instead of `provider`, `credentials` and `databases`, and document them in the help and schema
