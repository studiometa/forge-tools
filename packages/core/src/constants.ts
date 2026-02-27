/**
 * All supported resources.
 * Single source of truth — MCP schema and handlers derive from this.
 */
export const RESOURCES = [
  "servers",
  "sites",
  "deployments",
  "certificates",
  "databases",
  "database-users",
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
  "backups",
  "commands",
  "scheduled-jobs",
  "user",
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
  "context",
] as const;

export type Action = (typeof ACTIONS)[number];
