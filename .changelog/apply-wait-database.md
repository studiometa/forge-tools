### Fixed

- **CLI**: Fix `forge sites apply` on a new database: wait until Forge has installed the new database before it creates the user, and the new user before it creates the site. When the user is not installed in time, the error says that its password was not saved and that the user must be deleted on Forge
