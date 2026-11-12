### Fixed

- **CLI**: Fix `forge sites apply`, which added an alias again at each run: read the domains of the site from the domains route of Forge, because the API always returns `aliases: null` on a site. `{{ DOMAINS }}` in the Nginx file gets these domains too
- **Core**: Add `listDomains()` to list the domains of a site
