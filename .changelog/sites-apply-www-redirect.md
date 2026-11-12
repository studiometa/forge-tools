### Added

- **CLI**: Add the `wwwRedirect` key to the site file of `forge sites apply`: it sets the `www` redirect of a new site and updates the redirect of the primary domain of an existing site
- **Core**: Add `updateDomain()`, which updates a domain of a site with `PATCH /servers/{server}/sites/{site}/domains/{domain}`
- **API**: Add `UpdateDomainData` and `WWW_REDIRECT_TYPES`
