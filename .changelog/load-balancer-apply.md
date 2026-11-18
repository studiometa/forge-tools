### Added

- **CLI**: Add `forge load-balancer apply --file <load-balancer.json> [--check] [--force]`: create the site of a load balancer, set its nodes from the environments of the project, add its aliases and set its `www` redirect, from `config/forge/load-balancer.json` (JSON Schema `schemas/load-balancer.schema.json`). `--force` sends the nodes and the method even when the nodes match, to change only the method
- **SDK**: Add `forge.server(id).sites.createLoadBalancer()` to create a site on a load balancer (`POST /servers/{server}/sites/balancer`)
- **Core**: Add `createLoadBalancerSite` to create a site on a load balancer (`POST /servers/{server}/sites/balancer`)

### Removed

- **CLI**: Breaking: remove `loadBalancer` from the site file of `forge sites apply`; a site file with this key is now invalid. Use `forge load-balancer apply` and a load balancer file instead
