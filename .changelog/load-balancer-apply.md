### Added

- **CLI**: Add `forge load-balancer apply --file <load-balancer.json> [--check]`: create the site of a load balancer, set its nodes from the environments of the project and add its aliases, from `config/forge/load-balancer.json` (JSON Schema `schemas/load-balancer.schema.json`)
- **Core**: Add `createLoadBalancerSite` to create a site on a load balancer (`POST /servers/{server}/sites/balancer`)

### Removed

- **CLI**: Breaking: remove `loadBalancer` from the site file of `forge sites apply`; a site file with this key is now invalid. Use `forge load-balancer apply` and a load balancer file instead
