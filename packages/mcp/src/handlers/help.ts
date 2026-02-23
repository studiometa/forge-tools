import type { ToolResult } from "./types.ts";

import { jsonResult } from "./utils.ts";

const HELP_TEXTS: Record<string, string> = {
  servers: `## Servers

**Actions**: list, get, create, delete, reboot

### list
List all servers.
\`{ resource: "servers", action: "list" }\`

### get
Get server details.
\`{ resource: "servers", action: "get", id: "123" }\`

### create
Create a new server.
\`{ resource: "servers", action: "create", name: "web-1", provider: "ocean2", region: "ams3", size: "01", credential_id: "1", type: "app" }\`

### delete
Delete a server.
\`{ resource: "servers", action: "delete", id: "123" }\`

### reboot
Reboot a server.
\`{ resource: "servers", action: "reboot", id: "123" }\``,

  sites: `## Sites

**Actions**: list, get, create, delete
**Requires**: server_id

### list
List all sites on a server.
\`{ resource: "sites", action: "list", server_id: "123" }\`

### get
Get site details.
\`{ resource: "sites", action: "get", server_id: "123", id: "456" }\`

### create
Create a new site.
\`{ resource: "sites", action: "create", server_id: "123", domain: "example.com", project_type: "php" }\`

### delete
Delete a site.
\`{ resource: "sites", action: "delete", server_id: "123", id: "456" }\``,

  deployments: `## Deployments

**Actions**: list, deploy, get, update
**Requires**: server_id, site_id

### list
List deployments for a site.
\`{ resource: "deployments", action: "list", server_id: "123", site_id: "456" }\`

### deploy
Trigger a deployment.
\`{ resource: "deployments", action: "deploy", server_id: "123", site_id: "456" }\`

### get
Get deployment output (with id) or deployment script (without id).
\`{ resource: "deployments", action: "get", server_id: "123", site_id: "456", id: "789" }\`
\`{ resource: "deployments", action: "get", server_id: "123", site_id: "456" }\`

### update
Update the deployment script.
\`{ resource: "deployments", action: "update", server_id: "123", site_id: "456", content: "npm run build" }\``,

  env: `## Environment Variables

**Actions**: get, update
**Requires**: server_id, site_id

### get
Get the .env file content.
\`{ resource: "env", action: "get", server_id: "123", site_id: "456" }\`

### update
Update the .env file content.
\`{ resource: "env", action: "update", server_id: "123", site_id: "456", content: "APP_ENV=production" }\``,

  nginx: `## Nginx Configuration

**Actions**: get, update
**Requires**: server_id, site_id

### get
Get the Nginx configuration.
\`{ resource: "nginx", action: "get", server_id: "123", site_id: "456" }\`

### update
Update the Nginx configuration.
\`{ resource: "nginx", action: "update", server_id: "123", site_id: "456", content: "server { ... }" }\``,
};

/**
 * Handle help action — returns documentation for a specific resource.
 */
export function handleHelp(resource: string): ToolResult {
  const help = HELP_TEXTS[resource];
  if (help) {
    return jsonResult(help);
  }

  return handleHelpOverview();
}

/**
 * Return a global overview of all resources and actions.
 */
export function handleHelpOverview(): ToolResult {
  const overview = `# Laravel Forge MCP — Help

## Available Resources

| Resource | Actions | Required Fields |
|----------|---------|-----------------|
| servers | list, get, create, delete, reboot | id (for get/delete/reboot) |
| sites | list, get, create, delete | server_id, id (for get/delete) |
| deployments | list, deploy, get, update | server_id, site_id |
| env | get, update | server_id, site_id |
| nginx | get, update | server_id, site_id |
| certificates | list, get, create, delete | server_id, site_id |
| databases | list, get, create, delete | server_id |
| daemons | list, get, create, delete, restart | server_id |
| backups | list, get, create, delete | server_id |
| commands | list, get, create, delete | server_id, site_id |
| scheduled-jobs | list, get, create, delete | server_id |
| logs | get | server_id |
| firewall-rules | list, get, create, delete | server_id |
| ssh-keys | list, get, create, delete | server_id |
| security-rules | list, get, create, delete | server_id, site_id |
| redirect-rules | list, get, create, delete | server_id, site_id |
| nginx-templates | list, get, create, update, delete | server_id |
| monitors | list, get, create, delete | server_id |
| recipes | list, get, create, run, delete | — |

## Discovery

Use \`action: "help"\` with any resource for detailed documentation.

## Examples

\`{ resource: "servers", action: "list" }\`
\`{ resource: "sites", action: "list", server_id: "123" }\`
\`{ resource: "deployments", action: "deploy", server_id: "123", site_id: "456" }\``;

  return jsonResult(overview);
}
