### Added

- **CLI**: Add the `servers create` command, which creates a Custom VPS app server on Ubuntu 24.04 with PHP 8.4 by default

### Fixed

- **API**: Accept a null `revoked`, `connection_status` and `is_ready` in the server attributes, as the Forge API returns them for a server that is not provisioned
