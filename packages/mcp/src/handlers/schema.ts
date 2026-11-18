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
    actions: ["list", "get", "create", "update", "delete", "reboot", "resolve", "context"],
    scope: "global",
    required: {
      get: ["id"],
      create: ["provider", "type", "region", "name"],
      update: ["id"],
      delete: ["id"],
      reboot: ["id"],
      context: ["id"],
      resolve: ["query"],
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
    actions: ["list", "get", "create", "delete", "resolve", "context"],
    scope: "server",
    required: {
      list: ["server_id"],
      get: ["server_id", "id"],
      create: ["server_id", "type"],
      delete: ["server_id", "id"],
      context: ["server_id", "id"],
      resolve: ["server_id", "query"],
    },
    create: {
      type: { required: true, type: "string — php, html, symfony, etc." },
      name: { required: false, type: "string — domain name (e.g. example.com)" },
      web_directory: { required: false, type: "string — web root (/public)" },
    },
  },

  deployments: {
    actions: ["list", "deploy", "get", "update"],
    scope: "site",
    required: {
      list: ["server_id"],
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

  events: {
    actions: ["list", "get", "log"],
    scope: "global",
    required: { list: [], get: ["server_id", "id"], log: ["server_id", "id"] },
  },

  network: {
    actions: ["get", "update"],
    scope: "server",
    required: { get: ["server_id"], update: ["server_id", "servers"] },
  },

  "deploy-key": {
    actions: ["get", "create", "delete"],
    scope: "site",
    required: {
      get: ["server_id", "site_id"],
      create: ["server_id", "site_id"],
      delete: ["server_id", "site_id"],
    },
  },

  git: {
    actions: ["update"],
    scope: "site",
    required: {
      update: ["server_id", "site_id", "source_control_provider", "repository", "branch"],
    },
  },

  certificates: {
    actions: ["list", "get", "create", "delete", "activate", "deactivate"],
    scope: "domain",
    required: {
      list: ["server_id", "site_id"],
      get: ["server_id", "site_id", "domain_id"],
      create: ["server_id", "site_id", "domain_id", "type"],
      delete: ["server_id", "site_id", "domain_id", "id"],
      activate: ["server_id", "site_id", "domain_id", "id"],
      deactivate: ["server_id", "site_id", "domain_id", "id"],
    },
    create: {
      type: { required: true, type: "string — letsencrypt, csr, existing, clone" },
      enable: { required: false, type: "boolean — activate once installed (existing, clone)" },
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
      database_ids: { required: false, type: "array — database IDs to grant access to" },
    },
  },

  daemons: {
    actions: ["list", "get", "create", "delete", "restart", "log"],
    scope: "server",
    required: {
      list: ["server_id"],
      get: ["server_id", "id"],
      create: ["server_id", "command"],
      delete: ["server_id", "id"],
      restart: ["server_id", "id"],
      log: ["server_id", "id"],
    },
    create: {
      command: { required: true, type: "string — e.g. php artisan queue:work" },
      name: { required: false, type: "string — default: the command" },
      user: { required: false, type: "string — forge (default) or root" },
      directory: { required: false, type: "string — working directory" },
      processes: { required: false, type: "number — default: 1" },
    },
  },

  services: {
    actions: ["list", "restart"],
    scope: "server",
    required: {
      list: ["server_id"],
      restart: ["server_id", "service"],
    },
  },

  php: {
    actions: ["list", "get", "update"],
    scope: "server",
    required: {
      list: ["server_id"],
      get: ["server_id", "setting"],
      update: ["server_id", "setting"],
    },
  },

  "firewall-rules": {
    actions: ["list", "get", "create", "delete"],
    scope: "server",
    required: {
      list: ["server_id"],
      get: ["server_id", "id"],
      create: ["server_id", "name"],
      delete: ["server_id", "id"],
    },
    create: {
      name: { required: true, type: "string" },
      port: { required: false, type: "number|string — e.g. 80, 443, 8000-9000" },
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
      user: { required: false, type: "string — server user to add the key to" },
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
    actions: ["list", "get", "create", "delete", "export", "import", "reorder"],
    scope: "site",
    required: {
      list: ["server_id", "site_id"],
      get: ["server_id", "site_id", "id"],
      create: ["server_id", "site_id", "from", "to"],
      delete: ["server_id", "site_id", "id"],
      export: ["server_id", "site_id"],
      import: ["server_id", "site_id", "content", "mode"],
      reorder: ["server_id", "site_id", "redirects"],
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
      create: ["server_id", "type", "operator", "threshold", "notify"],
      delete: ["server_id", "id"],
    },
    create: {
      type: { required: true, type: "string — cpu_load, disk, free_memory, used_memory" },
      operator: { required: true, type: "string — gte, lte" },
      threshold: { required: true, type: "number — e.g. 80" },
      minutes: { required: false, type: "number — check interval in minutes" },
      notify: { required: true, type: "string — email notified on alert" },
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
    actions: ["list", "get", "create", "update", "delete"],
    scope: "server",
    required: {
      list: ["server_id"],
      get: ["server_id", "id"],
      create: ["server_id", "storage_provider_id", "frequency", "retention", "database_ids"],
      update: ["server_id", "id", "storage_provider_id", "frequency", "retention", "database_ids"],
      delete: ["server_id", "id"],
    },
    create: {
      storage_provider_id: { required: true, type: "number — storage provider ID" },
      frequency: { required: true, type: "string — hourly, daily, weekly, custom" },
      retention: { required: true, type: "number — backups to keep (1-8760)" },
      database_ids: { required: true, type: "number[] — database IDs to back up (at least one)" },
      include_new_databases: { required: false, type: "boolean — also back up new databases" },
      name: { required: false, type: "string — configuration name" },
      bucket: { required: false, type: "string — bucket (overrides the provider bucket)" },
      directory: { required: false, type: "string — directory in the bucket" },
      day: { required: false, type: "string — weekly: day of week, 0 (Sunday) to 6" },
      time: { required: false, type: "string — daily/weekly: HH:MM on the hour or half hour" },
      cron: { required: false, type: "string — custom: cron expression" },
      notification_email: { required: false, type: "string — email notified on failure" },
    },
  },

  "storage-providers": {
    actions: ["list", "get", "create", "delete"],
    scope: "global",
    required: {
      get: ["id"],
      create: ["name", "provider"],
      delete: ["id"],
    },
    create: {
      name: { required: true, type: "string — provider name" },
      provider: { required: true, type: "string — s3, spaces, hetzner, ovh, scaleway, custom" },
      endpoint: { required: false, type: "string — S3 endpoint URL (custom providers)" },
      region: { required: false, type: "string — bucket region" },
      bucket: { required: false, type: "string — default bucket" },
      directory: { required: false, type: "string — default directory" },
      access_key: { required: false, type: "string — access key ID" },
      secret_key: { required: false, type: "string — secret access key" },
      assume_role: { required: false, type: "boolean — use the EC2 instance role (s3)" },
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
        type: "string — minutely, hourly, nightly, weekly, monthly, reboot, custom (default: custom with cron, nightly without)",
      },
      cron: { required: false, type: "string — cron expression (custom frequency)" },
      name: { required: false, type: "string — job name" },
    },
  },

  user: {
    actions: ["get"],
    scope: "global",
    required: {},
  },

  batch: {
    actions: ["run"],
    scope: "global",
    required: {
      run: ["operations"],
    },
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
