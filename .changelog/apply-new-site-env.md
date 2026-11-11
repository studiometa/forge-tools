### Fixed

- **CLI**: Fix `forge sites apply` on a new site: write the whole `.env` with the `env` keys and the generated database keys only, instead of keeping the keys that Forge copies from `.env.example`. The plan shows `+ write .env with these keys only`. On an existing site, `apply` still adds the missing keys only
