/**
 * All supported resources.
 * Single source of truth — MCP schema and handlers derive from this.
 *
 * Only includes resources with implemented executors and handlers.
 * Deferred resources (backups, commands, scheduled-jobs, logs)
 * will be added when their executors are implemented.
 */
export const RESOURCES = [
  "servers",
  "sites",
  "deployments",
  "certificates",
  "databases",
  "daemons",
  "env",
  "nginx",
  "firewall-rules",
  "ssh-keys",
  "security-rules",
  "redirect-rules",
  "nginx-templates",
  "monitors",
  "recipes",
] as const;

export type Resource = (typeof RESOURCES)[number];

/**
 * All supported actions.
 * Single source of truth — MCP schema and handlers derive from this.
 */
export const ACTIONS = [
  "list",
  "get",
  "create",
  "update",
  "delete",
  "deploy",
  "reboot",
  "restart",
  "activate",
  "run",
  "help",
  "schema",
] as const;

export type Action = (typeof ACTIONS)[number];
