### Added

- **CLI**: Add `nginx` to the site file of `forge sites apply`: an Nginx file with Forge template variables, rendered for the site, compared with Forge and written when it differs
- **CLI**: Add `database.env` to the site file of `forge sites apply` to write the database name, user and password into other `.env` keys
- **CLI**: Add `forge servers public-key <server>` to print the public key of the `forge` user, the key that the git host must accept
