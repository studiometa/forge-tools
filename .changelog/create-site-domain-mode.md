### Fixed

- **CLI**: Fix `forge sites apply` on a new site: send the `domain_mode`, `www_redirect_type` and `allow_wildcard_subdomains` fields that the Forge API now requires
- **API**: Type `allow_wildcard_subdomains` of `CreateSiteData` as a boolean
