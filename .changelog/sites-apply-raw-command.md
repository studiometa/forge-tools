### Added

- **CLI**: Add template variables to the commands of `workers` and `schedule`, and to the `directory` of a worker, in the site file of `forge sites apply`: `{{FORGE_PHP}}`, `{{FORGE_PHP_FPM}}`, `{{FORGE_SERVER_ID}}`, `{{FORGE_SITE_BRANCH}}`, `{{FORGE_SITE_ID}}`, `{{FORGE_SITE_PATH}}` and `{{FORGE_SITE_USER}}`, with the values of the Forge deploy script. The syntax and the rules are those of the Nginx file: an unknown variable exits `3`

### Changed

- **CLI**: Breaking: `forge sites apply` no longer replaces a relative `artisan` with the absolute path of the site, in commands and in their comparison: write `{{ FORGE_SITE_PATH }}/artisan` in a site file that used `php artisan` in a scheduled job

### Fixed

- **CLI**: Fix `forge sites apply`, which created a scheduled job with the canonical form of its command: each word was quoted again, so `$(...)`, `~`, globs and `&&` did not work. The job is now created, and shown in the plan, with the command of the site file, with only its variables rendered
