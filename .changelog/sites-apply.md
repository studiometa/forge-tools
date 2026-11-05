### Added

- **CLI**: Add `forge sites apply --file site.json [--check]` to declare a Forge site in a JSON file (site, aliases, database, `.env` keys, workers and scheduled jobs) and print or apply the changes, with a JSON Schema published in the package
- **Core**: Add the `createDomain` executor to add a domain to a site
- **Core**: Add the `site_id` option to `listDaemons`, to list the daemons that Forge associates with a site
- **API**: Add `DomainAttributes`, `CreateDomainData` and the `site_id` field of `CreateDaemonData`

### Fixed

- **Core**: List every page of sites, databases, database users, daemons and scheduled jobs, not only the first 30 items
