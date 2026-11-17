### Added

- **Core**: Add `getDomainNginxConfig()`, which reads the Nginx configuration of a domain with `GET /servers/{server}/sites/{site}/domains/{domain}/nginx`

### Fixed

- **CLI**: Fix `wildcards` in `forge sites apply` on a site created before October 2025: Forge keeps "Allow wildcard subdomains" on the site there, and its domains report `false`. `apply` now compares with the site, and warns instead of updating the domain when it differs, because the Forge API cannot change the setting of the site
