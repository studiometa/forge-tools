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
  "daemons",
  "env",
  "nginx",
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
  "help",
  "schema",
] as const;

export type Action = (typeof ACTIONS)[number];
