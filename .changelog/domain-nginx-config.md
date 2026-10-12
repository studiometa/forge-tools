### Added

- **Core/SDK/MCP/CLI**: Add per-domain Nginx configuration (`GET`/`PUT .../sites/{site}/domains/{domain}/nginx`): Core `getDomainNginxConfig` and `updateDomainNginxConfig`, SDK `site(id).domain(id).nginx.get()` and `.update()`, and an optional `domain_id` on the MCP `nginx` resource; Core, MCP and CLI accept a domain record ID or a domain name such as `www.example.com`
- **CLI**: Add `--domain <id|name>` to `forge nginx get` and `forge nginx update` to read or replace the Nginx configuration of one domain of the site; `update` keeps `--file <path|->`, `--content` and `--check`
- **Core/SDK**: Add a read-only domains list for a site (Core `listDomains` and `resolveDomainId`, SDK `site(id).domains.list()`, `.all()` and `.resolve()`)

### Fixed

- **Core/SDK/MCP/CLI**: Send the site Nginx configuration as `config` and the site environment as `environment` in the update request body, as the Forge API requires
