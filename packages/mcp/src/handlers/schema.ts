/**
 * Schema handler — compact, machine-readable resource specifications.
 *
 * More concise than action=help, optimized for LLM consumption when only
 * field metadata is needed (actions, required params, field descriptions).
 */

import type { ToolResult } from "./types.ts";

import { jsonResult } from "./utils.ts";

interface ResourceFieldSpec {
  required: boolean;
  type: string;
}

interface ResourceSchemaData {
  actions: string[];
  scope: string;
  required: Record<string, string[]>;
  create?: Record<string, ResourceFieldSpec>;
}

const RESOURCE_SCHEMAS: Record<string, ResourceSchemaData> = {
  servers: {
    actions: ["list", "get", "create", "delete", "reboot", "context"],
    scope: "global",
    required: {
      get: ["id"],
      create: ["provider", "type", "region", "name"],
      delete: ["id"],
      reboot: ["id"],
      context: ["id"],
    },
    create: {
      provider: { required: true, type: "string — hetzner, ocean2, aws, etc." },
      type: { required: true, type: "string — app, web, worker, etc." },
      region: { required: true, type: "string — provider-specific region code" },
      name: { required: true, type: "string" },
      credential_id: { required: false, type: "string — provider credential ID" },
      php_version: { required: false, type: "string — php84, php83, etc." },
      database: { required: false, type: "string — database name to create" },
    },
  },

  sites: {
    actions: ["list", "get", "create", "delete", "context"],
    scope: "server",
    required: {
      list: ["server_id"],
      get: ["server_id", "id"],
      create: ["server_id", "domain", "project_type"],
      delete: ["server_id", "id"],
      context: ["server_id", "id"],
    },
    create: {
      domain: { required: true, type: "string — e.g. example.com" },
      project_type: { required: true, type: "string — php, html, symfony, etc." },
      directory: { required: false, type: "string — web root (/public)" },
    },
  },

  deployments: {
    actions: ["list", "deploy", "get", "update"],
    scope: "site",
    required: {
      list: ["server_id", "site_id"],
      deploy: ["server_id", "site_id"],
      get: ["server_id", "site_id", "id"],
      update: ["server_id", "site_id", "content"],
    },
  },

  env: {
    actions: ["get", "update"],
    scope: "site",
    required: {
      get: ["server_id", "site_id"],
      update: ["server_id", "site_id", "content"],
    },
  },

  nginx: {
    actions: ["get", "update"],
    scope: "site",
    required: {
      get: ["server_id", "site_id"],
      update: ["server_id", "site_id", "content"],
    },
  },

  certificates: {
    actions: ["list", "get", "create", "delete", "activate"],
    scope: "site",
    required: {
      list: ["server_id", "site_id"],
      get: ["server_id", "site_id", "id"],
      create: ["server_id", "site_id", "domain"],
      delete: ["server_id", "site_id", "id"],
      activate: ["server_id", "site_id", "id"],
    },
    create: {
      type: { required: false, type: "string — new, existing, clone (default: new)" },
      domain: { required: true, type: "string" },
    },
  },

  databases: {
    actions: ["list", "get", "create", "delete"],
    scope: "server",
    required: {
      list: ["server_id"],
      get: ["server_id", "id"],
      create: ["server_id", "name"],
      delete: ["server_id", "id"],
    },
    create: {
      name: { required: true, type: "string — database name" },
      user: { required: false, type: "string — database user to create" },
      password: { required: false, type: "string — user password" },
    },
  },

  "database-users": {
    actions: ["list", "get", "create", "delete"],
    scope: "server",
    required: {
      list: ["server_id"],
      get: ["server_id", "id"],
      create: ["server_id", "name", "password"],
      delete: ["server_id", "id"],
    },
    create: {
      name: { required: true, type: "string — database user name" },
      password: { required: true, type: "string — user password" },
      databases: { required: false, type: "array — database IDs to grant access to" },
    },
  },

  daemons: {
    actions: ["list", "get", "create", "delete", "restart"],
    scope: "server",
    required: {
      list: ["server_id"],
      get: ["server_id", "id"],
      create: ["server_id", "command"],
      delete: ["server_id", "id"],
      restart: ["server_id", "id"],
    },
    create: {
      command: { required: true, type: "string — e.g. php artisan queue:work" },
      user: { required: false, type: "string — default: forge" },
      directory: { required: false, type: "string — working directory" },
      processes: { required: false, type: "number — default: 1" },
    },
  },

  "firewall-rules": {
    actions: ["list", "get", "create", "delete"],
    scope: "server",
    required: {
      list: ["server_id"],
      get: ["server_id", "id"],
      create: ["server_id", "name", "port"],
      delete: ["server_id", "id"],
    },
    create: {
      name: { required: true, type: "string" },
      port: { required: true, type: "number|string — e.g. 80, 443, 8000-9000" },
      type: { required: false, type: "string — allow (default) or deny" },
      ip_address: { required: false, type: "string — restrict to IP" },
    },
  },

  "ssh-keys": {
    actions: ["list", "get", "create", "delete"],
    scope: "server",
    required: {
      list: ["server_id"],
      get: ["server_id", "id"],
      create: ["server_id", "name", "key"],
      delete: ["server_id", "id"],
    },
    create: {
      name: { required: true, type: "string — key label" },
      key: { required: true, type: "string — public key content" },
      username: { required: false, type: "string — user to add key to" },
    },
  },

  "security-rules": {
    actions: ["list", "get", "create", "delete"],
    scope: "site",
    required: {
      list: ["server_id", "site_id"],
      get: ["server_id", "site_id", "id"],
      create: ["server_id", "site_id", "name", "credentials"],
      delete: ["server_id", "site_id", "id"],
    },
    create: {
      name: { required: true, type: "string — rule name" },
      path: { required: false, type: "string — protected path (default: /)" },
      credentials: { required: true, type: "array — [{username, password}]" },
    },
  },

  "redirect-rules": {
    actions: ["list", "get", "create", "delete"],
    scope: "site",
    required: {
      list: ["server_id", "site_id"],
      get: ["server_id", "site_id", "id"],
      create: ["server_id", "site_id", "from", "to"],
      delete: ["server_id", "site_id", "id"],
    },
    create: {
      from: { required: true, type: "string — source path" },
      to: { required: true, type: "string — destination URL" },
      type: { required: false, type: "string — redirect (302) or permanent (301)" },
    },
  },

  monitors: {
    actions: ["list", "get", "create", "delete"],
    scope: "server",
    required: {
      list: ["server_id"],
      get: ["server_id", "id"],
      create: ["server_id", "type", "operator", "threshold", "minutes"],
      delete: ["server_id", "id"],
    },
    create: {
      type: { required: true, type: "string — disk, cpu, memory, etc." },
      operator: { required: true, type: "string — gte, lte" },
      threshold: { required: true, type: "number — e.g. 80" },
      minutes: { required: true, type: "number — check interval in minutes" },
    },
  },

  "nginx-templates": {
    actions: ["list", "get", "create", "update", "delete"],
    scope: "server",
    required: {
      list: ["server_id"],
      get: ["server_id", "id"],
      create: ["server_id", "name", "content"],
      update: ["server_id", "id"],
      delete: ["server_id", "id"],
    },
    create: {
      name: { required: true, type: "string — template name" },
      content: { required: true, type: "string — nginx configuration template" },
    },
  },

  backups: {
    actions: ["list", "get", "create", "delete"],
    scope: "server",
    required: {
      list: ["server_id"],
      get: ["server_id", "id"],
      create: ["server_id", "provider", "credentials", "frequency", "databases"],
      delete: ["server_id", "id"],
    },
    create: {
      provider: { required: true, type: "string — s3, spaces, custom" },
      credentials: { required: true, type: "object — provider credentials (key, secret, etc.)" },
      frequency: { required: true, type: "string — daily, weekly, custom" },
      databases: { required: true, type: "array — database IDs to back up" },
      directory: { required: false, type: "string — backup directory" },
      email: { required: false, type: "string — notification email" },
      retention: { required: false, type: "number — backups to retain (default: 7)" },
    },
  },

  commands: {
    actions: ["list", "get", "create"],
    scope: "site",
    required: {
      list: ["server_id", "site_id"],
      get: ["server_id", "site_id", "id"],
      create: ["server_id", "site_id", "command"],
    },
    create: {
      command: { required: true, type: "string — shell command to execute" },
    },
  },

  "scheduled-jobs": {
    actions: ["list", "get", "create", "delete"],
    scope: "server",
    required: {
      list: ["server_id"],
      get: ["server_id", "id"],
      create: ["server_id", "command"],
      delete: ["server_id", "id"],
    },
    create: {
      command: { required: true, type: "string — command to schedule" },
      user: { required: false, type: "string — execution user (default: forge)" },
      frequency: {
        required: false,
        type: "string — minutely, hourly, nightly, weekly, monthly, custom",
      },
      minute: { required: false, type: "string — cron minute field (custom frequency)" },
      hour: { required: false, type: "string — cron hour field" },
      day: { required: false, type: "string — cron day field" },
      month: { required: false, type: "string — cron month field" },
      weekday: { required: false, type: "string — cron weekday field" },
    },
  },

  user: {
    actions: ["get"],
    scope: "global",
    required: {},
  },

  recipes: {
    actions: ["list", "get", "create", "delete", "run"],
    scope: "global",
    required: {
      get: ["id"],
      create: ["name", "script"],
      delete: ["id"],
      run: ["id", "servers"],
    },
    create: {
      name: { required: true, type: "string — recipe name" },
      script: { required: true, type: "string — bash script content" },
      user: { required: false, type: "string — execution user (default: root)" },
    },
  },
};

/**
 * Handle schema action — returns compact spec for a specific resource.
 */
export function handleSchema(resource: string): ToolResult {
  const schema = RESOURCE_SCHEMAS[resource];

  if (!schema) {
    return jsonResult({
      error: `Unknown resource: ${resource}`,
      available_resources: Object.keys(RESOURCE_SCHEMAS),
    });
  }

  return jsonResult({ resource, ...schema });
}

/**
 * Get schema overview for all resources.
 */
export function handleSchemaOverview(): ToolResult {
  const overview = Object.entries(RESOURCE_SCHEMAS).map(([resource, schema]) => ({
    resource,
    actions: schema.actions,
    scope: schema.scope,
  }));

  return jsonResult({
    _tip: 'Use action="schema" with a specific resource for full required/create spec',
    resources: overview,
  });
}
