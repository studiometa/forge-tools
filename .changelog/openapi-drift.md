### Added

- **API**: Add the Valibot schemas and types of every other resource and request of the Forge OpenAPI spec (events, logs, outputs, deploy keys and hooks, webhooks, domain DNS records, heartbeats, Composer and npm credentials, integrations, server keys, recipe runs, Forge recipes, team members and invitations, roles, permissions, providers, server credentials, VPCs), and a test that compares each schema with the spec
- **API**: Send a `FormData` body as a multipart form
- **SDK**: Cover every operation of the Forge API, with a test that fails when a spec operation has no SDK method: organizations, organization sites and events, archived servers, server events, deployments, network, key and logs, PHP installs and default versions, database synchronization and root password, database user updates, backup instances and restores, daemon updates and actions, service stop and PHP reload, domains, site git, healthcheck, logs, deploy key, load balancing nodes, Composer and npm credentials, heartbeats, integrations, deployment webhooks, deployment state, deploy hook and push to deploy, redirect rules export, import and reorder, security rule and storage provider updates, recipe updates and runs, Forge recipes, teams, members and invitations, roles, permissions, providers and server credentials
- **SDK**: Add filters, sort, page size and includes to each `list()` and `all()`, typed from the spec
- **Core**: Add `listEvents`, `getEvent`, `getEventOutput`, `getServerNetwork`, `updateServerNetwork`, `getSiteDeployKey`, `createSiteDeployKey`, `deleteSiteDeployKey`, `updateSiteGit`, `exportRedirectRules`, `importRedirectRules`, `reorderRedirectRules` and `deactivateCertificate`; `listDeployments` lists the deployments of a server without `site_id`
- **MCP**: Add the `events`, `network`, `deploy-key` and `git` resources, the `deactivate` action to `certificates`, and the `export`, `import` and `reorder` actions to `redirect-rules`; `deployments` `list` works without `site_id`
- **CLI**: Add `forge events`, `forge network`, `forge deploy-key` and `forge git update`, `forge redirect-rules export|import|reorder`, and `forge certificates create|delete|deactivate`; `forge deployments list` works without `--site`

### Changed

- **SDK**: Breaking: `sites.update()` takes `UpdateSiteData` instead of `Partial<CreateSiteData>`, `RunRecipeOptions` is `RunRecipeData` (with `email`), and each `*ListOptions` is a `ListOptions` type
- **API**: Breaking: `CreateFirewallRuleData.type` is `"allow" | "deny"`
- **MCP**: Breaking: `monitors` `create` requires `notify` and accepts only the spec types and operators; `scheduled-jobs` `create` accepts only the spec frequencies
- **CLI**: Breaking: `forge monitors create` requires `--notify`, accepts only the spec types and operators, and sends `--minutes` only when given

### Fixed

- **SDK**: Fix `deployments.output()`, which called `/deployments/{id}/output` instead of `/deployments/{id}/log`
- **SDK**: Fix `env.get()` and `nginx.get()`, which returned the JSON:API document instead of the content
- **SDK**: Send no body to start a deployment, as the spec says
- **SDK**: Return an empty string instead of `"null"` for a PHP limit that is not set
- **Core**: Read the site again after `updateSite`, as Forge answers the update with 202 and no body
- **Core**: Accept a null Nginx configuration of a site or a domain
- **Core**: Send no body when triggering a deployment
- **MCP**: Send the required `type` (default `allow`) and a string `port` when creating a firewall rule
- **MCP**: Send the required `user` and `frequency` when creating a scheduled job, and `name`, `user` and `processes` when creating a daemon
- **MCP**: Accept numbers for the threshold and minutes of a monitor
