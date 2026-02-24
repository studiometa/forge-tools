/**
 * Help handler — provides detailed documentation for each resource.
 *
 * Follows the productive-tools convention: per-resource docs with
 * actions, required fields, field descriptions, and examples.
 */

import type { ToolResult } from "./types.ts";

import { jsonResult } from "./utils.ts";

interface ResourceHelp {
  description: string;
  scope: string;
  actions: Record<string, string>;
  fields?: Record<string, string>;
  examples?: Array<{ description: string; params: Record<string, unknown> }>;
}

const RESOURCE_HELP: Record<string, ResourceHelp> = {
  servers: {
    description:
      "Manage Laravel Forge servers — provisioned cloud instances (DigitalOcean, AWS, Hetzner, etc.)",
    scope: "global (no parent ID needed)",
    actions: {
      list: "List all servers in your Forge account",
      get: "Get a single server by ID with full details",
      create: "Provision a new server (requires provider, type, region, name)",
      delete: "Delete a server by ID (irreversible)",
      reboot: "Reboot a server by ID",
    },
    fields: {
      id: "Server ID",
      name: "Server name (hostname)",
      provider: "Cloud provider (hetzner, ocean2, aws, linode, vultr, custom)",
      region: "Provider region code",
      ip_address: "Public IP address",
      is_ready: "Whether the server has finished provisioning",
      php_version: "Default PHP version (php84, php83, etc.)",
    },
    examples: [
      { description: "List all servers", params: { resource: "servers", action: "list" } },
      {
        description: "Get server details",
        params: { resource: "servers", action: "get", id: "123" },
      },
      {
        description: "Reboot a server",
        params: { resource: "servers", action: "reboot", id: "123" },
      },
    ],
  },

  sites: {
    description: "Manage sites on a Forge server — web applications, PHP projects, static sites",
    scope: "server (requires server_id)",
    actions: {
      list: "List all sites on a server",
      get: "Get a single site by ID",
      create: "Create a new site (requires domain, project_type)",
      delete: "Delete a site by ID",
    },
    fields: {
      id: "Site ID",
      server_id: "Parent server ID",
      name: "Domain name (e.g. example.com)",
      project_type: "Project type (php, html, symfony, symfony_dev, symfony_four, laravel)",
      directory: "Web root directory (e.g. /public)",
      repository: "Git repository URL (if connected)",
      deployment_status: "Last deployment status (null, deploying, deployed, failed)",
    },
    examples: [
      {
        description: "List sites on a server",
        params: { resource: "sites", action: "list", server_id: "123" },
      },
      {
        description: "Get site details",
        params: { resource: "sites", action: "get", server_id: "123", id: "456" },
      },
      {
        description: "Create a Laravel site",
        params: {
          resource: "sites",
          action: "create",
          server_id: "123",
          domain: "app.example.com",
          project_type: "php",
          directory: "/public",
        },
      },
    ],
  },

  deployments: {
    description: "Manage site deployments — trigger, monitor, and configure deploy scripts",
    scope: "site (requires server_id + site_id)",
    actions: {
      list: "List recent deployments for a site",
      deploy: "Trigger a new deployment",
      get: "Get deployment output (requires deployment_id in 'id' field)",
      update: "Update the deployment script (provide 'content' field)",
    },
    fields: {
      id: "Deployment ID",
      server_id: "Parent server ID",
      site_id: "Parent site ID",
      status: "Deployment status (null, deploying, deployed, failed)",
      displayable_type: "Type of deployment trigger",
      ended_at: "Completion timestamp",
    },
    examples: [
      {
        description: "Deploy a site",
        params: { resource: "deployments", action: "deploy", server_id: "123", site_id: "456" },
      },
      {
        description: "List deployments",
        params: { resource: "deployments", action: "list", server_id: "123", site_id: "456" },
      },
      {
        description: "Get deployment output",
        params: {
          resource: "deployments",
          action: "get",
          server_id: "123",
          site_id: "456",
          id: "789",
        },
      },
      {
        description: "Update deploy script",
        params: {
          resource: "deployments",
          action: "update",
          server_id: "123",
          site_id: "456",
          content:
            "cd /home/forge/app.example.com\ngit pull\ncomposer install\nphp artisan migrate --force",
        },
      },
    ],
  },

  env: {
    description: "Manage environment variables (.env file) for a site",
    scope: "site (requires server_id + site_id)",
    actions: {
      get: "Get the current .env file content",
      update: "Replace the entire .env file (provide 'content' field)",
    },
    examples: [
      {
        description: "Get env variables",
        params: { resource: "env", action: "get", server_id: "123", site_id: "456" },
      },
      {
        description: "Update env",
        params: {
          resource: "env",
          action: "update",
          server_id: "123",
          site_id: "456",
          content: "APP_ENV=production\nAPP_DEBUG=false\nDB_HOST=127.0.0.1",
        },
      },
    ],
  },

  nginx: {
    description: "Manage Nginx configuration for a site",
    scope: "site (requires server_id + site_id)",
    actions: {
      get: "Get the current Nginx config",
      update: "Replace the Nginx config (provide 'content' field)",
    },
    examples: [
      {
        description: "Get nginx config",
        params: { resource: "nginx", action: "get", server_id: "123", site_id: "456" },
      },
    ],
  },

  certificates: {
    description: "Manage SSL/TLS certificates for a site — Let's Encrypt, custom, or cloned",
    scope: "site (requires server_id + site_id)",
    actions: {
      list: "List certificates for a site",
      get: "Get certificate details",
      create: "Create/request a new certificate",
      delete: "Delete a certificate",
      activate: "Activate a certificate (make it the active cert for the site)",
    },
    examples: [
      {
        description: "List certificates",
        params: { resource: "certificates", action: "list", server_id: "123", site_id: "456" },
      },
      {
        description: "Create Let's Encrypt cert",
        params: {
          resource: "certificates",
          action: "create",
          server_id: "123",
          site_id: "456",
          domain: "example.com",
          type: "new",
        },
      },
      {
        description: "Activate a certificate",
        params: {
          resource: "certificates",
          action: "activate",
          server_id: "123",
          site_id: "456",
          id: "789",
        },
      },
    ],
  },

  databases: {
    description: "Manage MySQL/PostgreSQL databases on a server",
    scope: "server (requires server_id)",
    actions: {
      list: "List databases on a server",
      get: "Get database details",
      create: "Create a new database (optionally with user)",
      delete: "Delete a database",
    },
    fields: {
      name: "Database name",
      user: "(create only) Create a database user",
      password: "(create only) User password",
    },
    examples: [
      {
        description: "List databases",
        params: { resource: "databases", action: "list", server_id: "123" },
      },
      {
        description: "Create database with user",
        params: {
          resource: "databases",
          action: "create",
          server_id: "123",
          name: "myapp",
          user: "admin",
          password: "secret123",
        },
      },
    ],
  },

  "database-users": {
    description: "Manage database users on a server",
    scope: "server (requires server_id)",
    actions: {
      list: "List database users on a server",
      get: "Get database user details",
      create: "Create a new database user",
      delete: "Delete a database user",
    },
    fields: {
      name: "Database user name",
      password: "User password",
      databases: "(create only) Array of database IDs to grant access to",
    },
    examples: [
      {
        description: "List database users",
        params: { resource: "database-users", action: "list", server_id: "123" },
      },
      {
        description: "Create a database user",
        params: {
          resource: "database-users",
          action: "create",
          server_id: "123",
          name: "forge",
          password: "secret123",
          databases: [1, 2],
        },
      },
    ],
  },

  daemons: {
    description: "Manage background processes (daemons) — queue workers, websocket servers, etc.",
    scope: "server (requires server_id)",
    actions: {
      list: "List daemons on a server",
      get: "Get daemon details",
      create: "Create a new daemon",
      delete: "Delete a daemon",
      restart: "Restart a daemon",
    },
    fields: {
      command: "Shell command to run",
      user: "Execution user (default: forge)",
      directory: "Working directory",
      processes: "Number of processes (default: 1)",
    },
    examples: [
      {
        description: "List daemons",
        params: { resource: "daemons", action: "list", server_id: "123" },
      },
      {
        description: "Create queue worker",
        params: {
          resource: "daemons",
          action: "create",
          server_id: "123",
          command: "php artisan queue:work --tries=3",
          user: "forge",
        },
      },
      {
        description: "Restart a daemon",
        params: { resource: "daemons", action: "restart", server_id: "123", id: "456" },
      },
    ],
  },

  "firewall-rules": {
    description: "Manage UFW firewall rules on a server",
    scope: "server (requires server_id)",
    actions: {
      list: "List firewall rules",
      get: "Get rule details",
      create: "Create a new firewall rule",
      delete: "Delete a firewall rule",
    },
    fields: {
      name: "Rule name/description",
      port: "Port number or range (e.g. 80, 8000-9000)",
      type: "allow or deny (default: allow)",
      ip_address: "Restrict to specific IP (optional)",
    },
    examples: [
      {
        description: "List firewall rules",
        params: { resource: "firewall-rules", action: "list", server_id: "123" },
      },
      {
        description: "Open port 3000",
        params: {
          resource: "firewall-rules",
          action: "create",
          server_id: "123",
          name: "Allow Node.js",
          port: 3000,
        },
      },
    ],
  },

  "ssh-keys": {
    description: "Manage SSH keys on a server",
    scope: "server (requires server_id)",
    actions: {
      list: "List SSH keys",
      get: "Get key details",
      create: "Add an SSH key to the server",
      delete: "Remove an SSH key",
    },
    fields: {
      name: "Key label/description",
      key: "Public key content (ssh-rsa ...)",
      username: "User to add the key to (optional)",
    },
    examples: [
      {
        description: "List SSH keys",
        params: { resource: "ssh-keys", action: "list", server_id: "123" },
      },
      {
        description: "Add SSH key",
        params: {
          resource: "ssh-keys",
          action: "create",
          server_id: "123",
          name: "Deploy Key",
          key: "ssh-rsa AAAA...",
        },
      },
    ],
  },

  "security-rules": {
    description: "Manage HTTP Basic Auth security rules for a site",
    scope: "site (requires server_id + site_id)",
    actions: {
      list: "List security rules",
      get: "Get rule details",
      create: "Create a security rule with credentials",
      delete: "Delete a security rule",
    },
    examples: [
      {
        description: "List security rules",
        params: { resource: "security-rules", action: "list", server_id: "123", site_id: "456" },
      },
      {
        description: "Create basic auth",
        params: {
          resource: "security-rules",
          action: "create",
          server_id: "123",
          site_id: "456",
          name: "Staging Auth",
          credentials: [{ username: "admin", password: "secret" }],
        },
      },
    ],
  },

  "redirect-rules": {
    description: "Manage URL redirect rules for a site",
    scope: "site (requires server_id + site_id)",
    actions: {
      list: "List redirect rules",
      get: "Get rule details",
      create: "Create a redirect rule",
      delete: "Delete a redirect rule",
    },
    fields: {
      from: "Source path (regex supported)",
      to: "Destination URL",
      type: "redirect (302, default) or permanent (301)",
    },
    examples: [
      {
        description: "List redirects",
        params: { resource: "redirect-rules", action: "list", server_id: "123", site_id: "456" },
      },
      {
        description: "Create redirect",
        params: {
          resource: "redirect-rules",
          action: "create",
          server_id: "123",
          site_id: "456",
          from: "/old-page",
          to: "/new-page",
          type: "permanent",
        },
      },
    ],
  },

  monitors: {
    description: "Manage server monitoring alerts — CPU, disk, memory thresholds",
    scope: "server (requires server_id)",
    actions: {
      list: "List monitors",
      get: "Get monitor details",
      create: "Create a monitor",
      delete: "Delete a monitor",
    },
    fields: {
      type: "Monitor type (disk, cpu, memory)",
      operator: "Comparison operator (gte, lte)",
      threshold: "Threshold value (e.g. 80 for 80%)",
      minutes: "Check interval in minutes",
    },
    examples: [
      {
        description: "List monitors",
        params: { resource: "monitors", action: "list", server_id: "123" },
      },
      {
        description: "Alert on high disk usage",
        params: {
          resource: "monitors",
          action: "create",
          server_id: "123",
          type: "disk",
          operator: "gte",
          threshold: 80,
          minutes: 5,
        },
      },
    ],
  },

  "nginx-templates": {
    description: "Manage reusable Nginx configuration templates on a server",
    scope: "server (requires server_id)",
    actions: {
      list: "List nginx templates",
      get: "Get template with content",
      create: "Create a new template",
      update: "Update template name or content",
      delete: "Delete a template",
    },
    examples: [
      {
        description: "List templates",
        params: { resource: "nginx-templates", action: "list", server_id: "123" },
      },
      {
        description: "Get template content",
        params: { resource: "nginx-templates", action: "get", server_id: "123", id: "456" },
      },
    ],
  },

  backups: {
    description:
      "Manage backup configurations — automated database backups to S3, Spaces, or other providers",
    scope: "server (requires server_id)",
    actions: {
      list: "List backup configurations on a server",
      get: "Get backup config details (databases, schedule, retention)",
      create: "Create a new backup configuration",
      delete: "Delete a backup configuration",
    },
    fields: {
      provider: "Backup provider (s3, spaces, custom)",
      credentials: "Provider credentials (keys, bucket, region)",
      frequency: "Backup frequency (daily, weekly, custom)",
      databases: "Array of database IDs to back up",
      retention: "Number of backups to retain",
    },
    examples: [
      {
        description: "List backup configs",
        params: { resource: "backups", action: "list", server_id: "123" },
      },
      {
        description: "Get backup config details",
        params: { resource: "backups", action: "get", server_id: "123", id: "456" },
      },
    ],
  },

  commands: {
    description: "Execute and list site commands — run artisan commands or shell scripts on a site",
    scope: "site (requires server_id + site_id)",
    actions: {
      list: "List commands executed on a site",
      get: "Get command details and status",
      create: "Execute a new command on the site",
    },
    fields: {
      command: "Shell command to execute",
    },
    examples: [
      {
        description: "List commands",
        params: { resource: "commands", action: "list", server_id: "123", site_id: "456" },
      },
      {
        description: "Run a command",
        params: {
          resource: "commands",
          action: "create",
          server_id: "123",
          site_id: "456",
          command: "php artisan migrate --force",
        },
      },
    ],
  },

  "scheduled-jobs": {
    description: "Manage cron jobs (scheduled tasks) on a server",
    scope: "server (requires server_id)",
    actions: {
      list: "List scheduled jobs on a server",
      get: "Get job details (command, frequency, cron expression)",
      create: "Create a new scheduled job",
      delete: "Delete a scheduled job",
    },
    fields: {
      command: "Shell command to schedule",
      user: "Execution user (default: forge)",
      frequency: "Frequency preset (minutely, hourly, nightly, weekly, monthly, custom)",
      minute: "(custom frequency) Minute field",
      hour: "(custom frequency) Hour field",
      day: "(custom frequency) Day of month field",
      month: "(custom frequency) Month field",
      weekday: "(custom frequency) Day of week field",
    },
    examples: [
      {
        description: "List scheduled jobs",
        params: { resource: "scheduled-jobs", action: "list", server_id: "123" },
      },
      {
        description: "Create minutely scheduler",
        params: {
          resource: "scheduled-jobs",
          action: "create",
          server_id: "123",
          command: "php /home/forge/app.com/artisan schedule:run",
          frequency: "minutely",
          user: "forge",
        },
      },
    ],
  },

  user: {
    description: "Get the currently authenticated Forge user profile",
    scope: "global (no parent ID needed)",
    actions: {
      get: "Get the authenticated user's profile (name, email, connected services)",
    },
    examples: [
      {
        description: "Get user profile",
        params: { resource: "user", action: "get" },
      },
    ],
  },

  recipes: {
    description:
      "Manage and run server recipes — reusable bash scripts executed on one or more servers",
    scope: "global (no parent ID needed)",
    actions: {
      list: "List all recipes",
      get: "Get recipe details and script content",
      create: "Create a new recipe",
      delete: "Delete a recipe",
      run: "Run a recipe on specified servers (provide 'servers' as array of server IDs)",
    },
    fields: {
      name: "Recipe name",
      script: "Bash script content",
      user: "Execution user (default: root)",
      servers: "(run only) Array of server IDs to run on",
    },
    examples: [
      { description: "List recipes", params: { resource: "recipes", action: "list" } },
      {
        description: "Create a recipe",
        params: {
          resource: "recipes",
          action: "create",
          name: "Clear caches",
          script: "php artisan cache:clear\nphp artisan view:clear",
        },
      },
      {
        description: "Run recipe on servers",
        params: { resource: "recipes", action: "run", id: "123", servers: [1, 2, 3] },
      },
    ],
  },
};

/**
 * Handle help action — returns documentation for a specific resource.
 */
export function handleHelp(resource: string): ToolResult {
  const help = RESOURCE_HELP[resource];

  if (!help) {
    return handleHelpOverview();
  }

  return jsonResult({ resource, ...help });
}

/**
 * Get help for all resources (overview).
 */
export function handleHelpOverview(): ToolResult {
  const overview = Object.entries(RESOURCE_HELP).map(([resource, help]) => ({
    resource,
    description: help.description,
    scope: help.scope,
    actions: Object.keys(help.actions),
  }));

  return jsonResult({
    message: 'Use action="help" with a specific resource for detailed documentation',
    resources: overview,
    _tip: "Always call { action: 'help', resource: '<name>' } before your first interaction with any resource to learn required fields and examples.",
  });
}
