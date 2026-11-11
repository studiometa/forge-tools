### Fixed

- **SDK**: `firewallRules.create()`, `redirectRules.create()`, `commands.create()` and `sites.update()` no longer fail on the empty `202` response of Forge, and return nothing
- **SDK**: `servers.reboot()`, `server().reboot()`, `daemons.restart()` and `site().deploy()` call the Forge routes of the API v2

### Removed

- **SDK**: `servers.update()`, because the Forge API v2 has no route to update a server
