### Fixed

- **CLI**: Fix `forge sites apply`, which created a scheduled job with the canonical form of its command: each word was quoted again, so `$(...)`, `~`, globs and `&&` did not work. The job is now created (and shown in the plan) with the command of the site file, with a relative `artisan` made absolute; the canonical form is only used to compare
