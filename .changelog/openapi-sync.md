### Added

- **API**: Add `UpdateServerDataSchema`, the new optional fields of the spec (`slug` of a server, `deployment_retention` of a site, `active` of a certificate, `exit_code` and `error_output` of a command, `database_ids` and `include_new_databases` of a backup configuration) and the new request fields (`enable` of a certificate, `source_control_provider_id` of a site, `backup_configuration_ids` of a database)
- **Core**: Add `listCertificates` (the certificates of a domain, or of every domain of a site) and `updateServer`
- **SDK**: Add `certificates.list()`, `certificates.active()`, `servers.update()` and `server(id).update()`
- **MCP**: Add the `list` action to `certificates` and the `update` action to `servers`
- **CLI**: Add `forge certificates list` and `forge servers update <server> [--name] [--ip-address] [--private-ip] [--timezone] [--tag]`

### Changed

- **Core**: Breaking: certificate executors use the routes of a domain with several certificates (`/domains/{domain}/certificates`): `getCertificate` gets the active certificate without `id`, and `deleteCertificate` and `activateCertificate` take the certificate `id`
- **SDK**: Breaking: `certificates.get(domainId, certificateId)`, `certificates.delete(domainId, certificateId)` and `certificates.activate(domainId, certificateId)` take the certificate ID; `certificates.active(domainId)` gets the active certificate
- **MCP**: Breaking: `certificates` `get` without `id` gets the active certificate of `domain_id`; `delete` and `activate` require `domain_id` and the certificate `id`
- **CLI**: Breaking: `forge certificates get [id]` and `forge certificates activate <id>` take the certificate ID as argument and require `--domain`
- **API**: Breaking: `CreateServerData` sends `credential_id`, `custom.ssh_port` and `custom.nat_ssh_port` as numbers and `custom.behind_nat` as a boolean, `CreateSiteData` requires `name` and sends `database_user_id` as a number, `CreateScheduledJobData.grace_period` and `CreateRecipeData.team_id` are numbers, as the Forge OpenAPI spec says
- Update `docs/forge-openapi-v2.json` from the Forge API (279 operations)

### Fixed

- **Core**: Fix the certificate routes, which Forge moved from `/domains/{domain}/certificate` to `/domains/{domain}/certificates/{certificate}`
- **SDK**: Fix the certificate routes, which Forge moved from `/domains/{domain}/certificate` to `/domains/{domain}/certificates/{certificate}`
- **Core**: Fix the activation of a certificate, which sent the action `activate` instead of `enable`
- **SDK**: Fix the activation of a certificate, which sent the action `activate` instead of `enable`
- **API**: Accept a `null` `deployment_url` and `php_version` of a site, `status` of a deployment status, `content` of a deployment script, PHP limits and `finished_at` of a backup (now a timestamp)
- **CLI**: Send the credential ID and SSH port of `forge servers create` as numbers
- **MCP**: Refuse a `domain_id` that is not an ID
