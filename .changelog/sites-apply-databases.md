### Added

- **CLI**: Allow several databases in the site file of `forge sites apply`: `database` can be an array. Each entry creates its database and its user when they are missing, a user named by several entries gets access to all their databases, and each entry sets its own `.env` keys

### Changed

- **CLI**: Breaking: in the JSON output of `forge sites apply`, `create-database-user` has `databases` (a list) instead of `database`, and `add-env` has `passwords` (a list) instead of `password`
