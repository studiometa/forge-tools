/**
 * All supported resources.
 * Single source of truth — MCP schema and handlers derive from this.
 */
export const RESOURCES = [
  // Phase 1
  "servers",
  "sites",
  "deployments",
  "certificates",
  "databases",
  "daemons",
  "env",
  "nginx",
  // Phase 2
  "backups",
  "commands",
  "scheduled-jobs",
  "logs",
  // Phase 3
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
