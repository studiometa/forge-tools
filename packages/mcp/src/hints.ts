/**
 * Contextual hints for AI agents.
 *
 * After get/list actions, suggests related resources and common next steps
 * to help agents discover what's available.
 */

interface ResourceHint {
  resource: string;
  description: string;
  example: Record<string, unknown>;
}

export interface ContextualHints {
  related_resources?: ResourceHint[];
  common_actions?: { action: string; example: Record<string, unknown> }[];
}

/**
 * Hints after getting a server.
 */
export function getServerHints(serverId: string): ContextualHints {
  return {
    related_resources: [
      {
        resource: "sites",
        description: "List sites on this server",
        example: { resource: "sites", action: "list", server_id: serverId },
      },
      {
        resource: "databases",
        description: "List databases",
        example: { resource: "databases", action: "list", server_id: serverId },
      },
      {
        resource: "daemons",
        description: "List background processes",
        example: { resource: "daemons", action: "list", server_id: serverId },
      },
      {
        resource: "firewall-rules",
        description: "List firewall rules",
        example: { resource: "firewall-rules", action: "list", server_id: serverId },
      },
      {
        resource: "ssh-keys",
        description: "List SSH keys on this server",
        example: { resource: "ssh-keys", action: "list", server_id: serverId },
      },
    ],
    common_actions: [
      {
        action: "Reboot server",
        example: { resource: "servers", action: "reboot", id: serverId },
      },
    ],
  };
}

/**
 * Hints after getting a site.
 */
export function getSiteHints(serverId: string, siteId: string): ContextualHints {
  return {
    related_resources: [
      {
        resource: "deployments",
        description: "List deployments for this site",
        example: { resource: "deployments", action: "list", server_id: serverId, site_id: siteId },
      },
      {
        resource: "env",
        description: "Get environment variables",
        example: { resource: "env", action: "get", server_id: serverId, site_id: siteId },
      },
      {
        resource: "certificates",
        description: "List SSL certificates",
        example: { resource: "certificates", action: "list", server_id: serverId, site_id: siteId },
      },
      {
        resource: "nginx",
        description: "Get nginx configuration",
        example: { resource: "nginx", action: "get", server_id: serverId, site_id: siteId },
      },
    ],
    common_actions: [
      {
        action: "Deploy this site",
        example: {
          resource: "deployments",
          action: "deploy",
          server_id: serverId,
          site_id: siteId,
        },
      },
    ],
  };
}

/**
 * Hints after getting a database.
 */
export function getDatabaseHints(serverId: string, databaseId: string): ContextualHints {
  return {
    related_resources: [
      {
        resource: "databases",
        description: "List all databases on this server",
        example: { resource: "databases", action: "list", server_id: serverId },
      },
    ],
    common_actions: [
      {
        action: "Delete this database",
        example: { resource: "databases", action: "delete", server_id: serverId, id: databaseId },
      },
    ],
  };
}

/**
 * Hints after getting a daemon.
 */
export function getDaemonHints(serverId: string, daemonId: string): ContextualHints {
  return {
    related_resources: [
      {
        resource: "daemons",
        description: "List all daemons on this server",
        example: { resource: "daemons", action: "list", server_id: serverId },
      },
    ],
    common_actions: [
      {
        action: "Restart this daemon",
        example: { resource: "daemons", action: "restart", server_id: serverId, id: daemonId },
      },
      {
        action: "Delete this daemon",
        example: { resource: "daemons", action: "delete", server_id: serverId, id: daemonId },
      },
    ],
  };
}

/**
 * Hints after getting a certificate.
 */
export function getCertificateHints(
  serverId: string,
  siteId: string,
  certificateId: string,
): ContextualHints {
  return {
    related_resources: [
      {
        resource: "certificates",
        description: "List all certificates for this site",
        example: {
          resource: "certificates",
          action: "list",
          server_id: serverId,
          site_id: siteId,
        },
      },
    ],
    common_actions: [
      {
        action: "Activate this certificate",
        example: {
          resource: "certificates",
          action: "activate",
          server_id: serverId,
          site_id: siteId,
          id: certificateId,
        },
      },
      {
        action: "Delete this certificate",
        example: {
          resource: "certificates",
          action: "delete",
          server_id: serverId,
          site_id: siteId,
          id: certificateId,
        },
      },
    ],
  };
}

/**
 * Hints after getting a firewall rule.
 */
export function getFirewallRuleHints(serverId: string, ruleId: string): ContextualHints {
  return {
    related_resources: [
      {
        resource: "firewall-rules",
        description: "List all firewall rules on this server",
        example: { resource: "firewall-rules", action: "list", server_id: serverId },
      },
    ],
    common_actions: [
      {
        action: "Delete this firewall rule",
        example: {
          resource: "firewall-rules",
          action: "delete",
          server_id: serverId,
          id: ruleId,
        },
      },
    ],
  };
}

/**
 * Hints after getting an SSH key.
 */
export function getSshKeyHints(serverId: string, keyId: string): ContextualHints {
  return {
    related_resources: [
      {
        resource: "ssh-keys",
        description: "List all SSH keys on this server",
        example: { resource: "ssh-keys", action: "list", server_id: serverId },
      },
    ],
    common_actions: [
      {
        action: "Delete this SSH key",
        example: { resource: "ssh-keys", action: "delete", server_id: serverId, id: keyId },
      },
    ],
  };
}

/**
 * Hints after getting a recipe.
 */
export function getRecipeHints(recipeId: string): ContextualHints {
  return {
    related_resources: [
      {
        resource: "recipes",
        description: "List all recipes",
        example: { resource: "recipes", action: "list" },
      },
    ],
    common_actions: [
      {
        action: "Run this recipe on servers",
        example: { resource: "recipes", action: "run", id: recipeId, servers: [] },
      },
      {
        action: "Delete this recipe",
        example: { resource: "recipes", action: "delete", id: recipeId },
      },
    ],
  };
}

/**
 * Hints after getting an nginx template.
 */
export function getNginxTemplateHints(serverId: string, templateId: string): ContextualHints {
  return {
    related_resources: [
      {
        resource: "nginx-templates",
        description: "List all nginx templates on this server",
        example: { resource: "nginx-templates", action: "list", server_id: serverId },
      },
    ],
    common_actions: [
      {
        action: "Update this nginx template",
        example: {
          resource: "nginx-templates",
          action: "update",
          server_id: serverId,
          id: templateId,
          content: "<nginx config content>",
        },
      },
      {
        action: "Delete this nginx template",
        example: {
          resource: "nginx-templates",
          action: "delete",
          server_id: serverId,
          id: templateId,
        },
      },
    ],
  };
}
